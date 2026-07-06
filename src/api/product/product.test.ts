import { describe, expect, it, vi } from "vitest";
import mockMongoose from "../../tests/mongoose-mock.js";

const { api, V1 } = await import("../../tests/helpers.js");

const validMongoId = "507f1f77bcf86cd799439011";

describe("GET /v1/products", () => {
    function makeFindChain(items: Record<string, unknown>[]) {
        const chain: Record<string, unknown> = {};
        chain.limit = vi.fn().mockReturnValue(chain);
        chain.sort = vi.fn().mockReturnValue(chain);
        chain.lean = vi.fn().mockResolvedValue(items);
        return chain;
    }

    it("returns a paginated list with cursor pagination shape", async () => {
        const productsMock = [
            { _id: { toString: () => "aaa" }, name: "Product 1", price: 100 },
            { _id: { toString: () => "bbb" }, name: "Product 2", price: 200 },
        ];
        mockMongoose.model("Product").find.mockReturnValueOnce(makeFindChain(productsMock));

        const response = await api.get(`${V1}/products`);

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("items");
        expect(response.body.data).toHaveProperty("pagination");
        expect(response.body.data.items).toHaveLength(2);
        expect(response.body.data.pagination).toMatchObject({
            limit: 10,
            hasMore: false,
            nextCursor: null,
        });
    });

    it("returns nextCursor and hasMore:true when more items exist beyond the page", async () => {
        const productsMock = Array.from({ length: 11 }, (_, i) => ({
            _id: { toString: () => `id${i}` },
            name: `Product ${i}`,
            price: i * 10,
        }));
        mockMongoose.model("Product").find.mockReturnValueOnce(makeFindChain(productsMock));

        const response = await api.get(`${V1}/products?limit=10`);

        expect(response.status).toBe(200);
        expect(response.body.data.pagination.hasMore).toBe(true);
        expect(response.body.data.pagination.nextCursor).toBe("id9");
        expect(response.body.data.items).toHaveLength(10);
    });

    it("respects the limit query param", async () => {
        mockMongoose.model("Product").find.mockReturnValueOnce(makeFindChain([]));

        const response = await api.get(`${V1}/products?limit=5`);

        expect(response.status).toBe(200);
        expect(response.body.data.pagination.limit).toBe(5);
    });

    it("filters by status and isFeatured when provided", async () => {
        mockMongoose.model("Product").find.mockReturnValueOnce(makeFindChain([]));

        const response = await api.get(`${V1}/products?status=active&isFeatured=true`);

        expect(response.status).toBe(200);
        expect(mockMongoose.model("Product").find).toHaveBeenCalledWith({
            status: "active",
            isFeatured: true,
        });
    });

    it("returns 400 when the cursor format is invalid", async () => {
        const response = await api.get(`${V1}/products?cursor=invalid`);
        expect(response.status).toBe(400);
    });

    it("returns 400 when the status filter value is not allowed", async () => {
        const response = await api.get(`${V1}/products?status=deleted`);
        expect(response.status).toBe(400);
    });

    it("returns 500 when the database query fails", async () => {
        const chain = makeFindChain([]);
        (chain.lean as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("DB error"));
        mockMongoose.model("Product").find.mockReturnValueOnce(chain);

        const response = await api.get(`${V1}/products`);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("message");
    });
});

describe("GET /v1/products/:id", () => {
    it("returns the product when found", async () => {
        const productMock = { _id: validMongoId, name: "Mocked Product 1", price: 100 };
        mockMongoose
            .model("Product")
            .findById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(productMock) });

        const response = await api.get(`${V1}/products/${validMongoId}`);

        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe(productMock.name);
        expect(response.body.data.price).toBe(productMock.price);
    });

    it("returns 404 when the product does not exist", async () => {
        mockMongoose
            .model("Product")
            .findById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });

        const response = await api.get(`${V1}/products/${validMongoId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Product not found");
    });

    it("returns 400 when the id is not a valid MongoDB ObjectId", async () => {
        const response = await api.get(`${V1}/products/invalid-id`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Validation failed");
    });
});

describe("POST /v1/products", () => {
    it("creates a product and returns it with status 201", async () => {
        const data = { name: "test", price: 10, stock: 5, status: "active", isFeatured: true };
        mockMongoose.model("Product").find.mockResolvedValueOnce(data);

        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer valid-token")
            .send(data);

        expect(response.status).toBe(201);
        expect(response.body.data).toMatchObject({
            name: data.name,
            price: data.price,
            stock: data.stock,
            status: data.status,
            isFeatured: true,
        });
    });

    it("applies defaults for stock, status, and isFeatured when omitted", async () => {
        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "test", price: 10 });

        expect(response.status).toBe(201);
        expect(response.body.data).toMatchObject({
            stock: 0,
            status: "draft",
            isFeatured: false,
        });
    });

    it("returns 400 when required fields are missing", async () => {
        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    it("returns 400 when stock is negative", async () => {
        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "test", price: 10, stock: -1 });

        expect(response.status).toBe(400);
    });

    it("returns 401 when the Authorization header is malformed", async () => {
        const response = await api.post(`${V1}/products`).set("Authorization", "random token");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Authorization header missing or invalid");
    });

    it("returns 401 when the Bearer token is empty", async () => {
        const response = await api.post(`${V1}/products`).set("Authorization", "Bearer ");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Authorization header missing or invalid");
    });

    it("returns 401 with INVALID_TOKEN code when the token signature is wrong", async () => {
        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("code", "INVALID_TOKEN");
    });

    it("returns 500 when the database write fails", async () => {
        mockMongoose.model("Product").prototype.save.mockRejectedValueOnce(new Error("DB error"));

        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "test", price: 10 });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("code");
    });
});

describe("PUT /v1/products/:id", () => {
    it("returns the updated product", async () => {
        const data = { name: "updated", price: 20, stock: 12, status: "archived" };
        mockMongoose
            .model("Product")
            .findByIdAndUpdate.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(data) });

        const response = await api
            .put(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token")
            .send(data);

        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject(data);
    });

    it("returns 400 when the request body is empty", async () => {
        const response = await api
            .put(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    it("returns 400 when the id is not a valid MongoDB ObjectId", async () => {
        const response = await api
            .put(`${V1}/products/invalid-id`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "updated", price: 20 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("returns 404 when the product does not exist", async () => {
        mockMongoose
            .model("Product")
            .findByIdAndUpdate.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });

        const response = await api
            .put(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "updated", price: 20 });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Product not found");
    });
});

describe("DELETE /v1/products/:id", () => {
    it("deletes the product and returns 200", async () => {
        const productMock = {
            _id: validMongoId,
            name: "Mocked Product 1",
            price: 100,
            status: "archived",
        };
        mockMongoose.model("Product").findOneAndDelete.mockResolvedValueOnce(productMock);

        const response = await api
            .delete(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(200);
    });

    it("returns 400 when the product is active", async () => {
        mockMongoose.model("Product").findOneAndDelete.mockResolvedValueOnce(null);
        mockMongoose.model("Product").findById.mockReturnValueOnce({
            lean: vi.fn().mockResolvedValue({ _id: validMongoId, status: "active" }),
        });

        const response = await api
            .delete(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty(
            "message",
            "Active products must be archived before deletion"
        );
    });

    it("returns 400 when the id is not a valid MongoDB ObjectId", async () => {
        const response = await api
            .delete(`${V1}/products/invalid-id`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Validation failed");
    });

    it("returns 404 when the product does not exist", async () => {
        mockMongoose.model("Product").findOneAndDelete.mockResolvedValueOnce(null);
        mockMongoose
            .model("Product")
            .findById.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });

        const response = await api
            .delete(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Product not found");
    });
});
