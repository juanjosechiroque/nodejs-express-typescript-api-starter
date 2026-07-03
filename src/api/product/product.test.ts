import { jest } from "@jest/globals";
import mockMongoose from "../../tests/jest-mongoose-mock.js";

const { api, V1 } = await import("../../tests/helpers.js");

describe(`GET ${V1}/products`, () => {
    function makeFindChain(items) {
        const chain = {};
        chain.limit = jest.fn().mockReturnValue(chain);
        chain.sort = jest.fn().mockReturnValue(chain);
        chain.lean = jest.fn().mockResolvedValue(items);
        return chain;
    }

    test("should return items with cursor pagination shape", async () => {
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

    test("should return nextCursor and hasMore true when more items exist", async () => {
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

    test("should accept limit query param", async () => {
        mockMongoose.model("Product").find.mockReturnValueOnce(makeFindChain([]));

        const response = await api.get(`${V1}/products?limit=5`);

        expect(response.status).toBe(200);
        expect(response.body.data.pagination.limit).toBe(5);
    });

    test("should return 400 when cursor format is invalid", async () => {
        const response = await api.get(`${V1}/products?cursor=invalid`);
        expect(response.status).toBe(400);
    });

    test("should return 500 when getProducts throws", async () => {
        const chain = {};
        chain.limit = jest.fn().mockReturnValue(chain);
        chain.sort = jest.fn().mockReturnValue(chain);
        chain.lean = jest.fn().mockRejectedValue(new Error("DB error"));
        mockMongoose.model("Product").find.mockReturnValueOnce(chain);

        const response = await api.get(`${V1}/products`);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("message");
    });
});

const validMongoId = "507f1f77bcf86cd799439011";

describe(`GET ${V1}/products/:id`, () => {
    test("should return a product by id", async () => {
        const productMock = {
            _id: validMongoId,
            name: "Mocked Product 1",
            price: 100,
        };
        mockMongoose
            .model("Product")
            .findById.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(productMock) });

        const response = await api.get(`${V1}/products/${validMongoId}`);

        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe(productMock.name);
        expect(response.body.data.price).toBe(productMock.price);
    });

    test("should return 404 when product not found", async () => {
        mockMongoose
            .model("Product")
            .findById.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(null) });

        const response = await api.get(`${V1}/products/${validMongoId}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Product not found");
    });

    test("should return 400 when id format is invalid", async () => {
        const response = await api.get(`${V1}/products/invalid-id`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Validation failed");
    });
});

describe(`POST ${V1}/products`, () => {
    test("should return a new product", async () => {
        const data = { name: "test", price: 10 };
        mockMongoose.model("Product").find.mockResolvedValueOnce(data);

        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer valid-token")
            .send(data);

        expect(response.status).toBe(201);

        const resultData = response.body.data;
        expect(resultData.name).toBe(data.name);
        expect(resultData.price).toBe(data.price);
    });

    test("should return an error when input is invalid", async () => {
        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    test("should return an error when token is unauthorized", async () => {
        const response = await api.post(`${V1}/products`).set("Authorization", "random token");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Authorization header missing or invalid");
    });

    test("should return an error when token is empty", async () => {
        const response = await api.post(`${V1}/products`).set("Authorization", "Bearer ");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Authorization header missing or invalid");
    });

    test("should return an error when token is invalid", async () => {
        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid or expired token");
        expect(response.body).toHaveProperty("code", "INVALID_TOKEN");
    });

    test("should return 500 when createProduct throws", async () => {
        mockMongoose.model("Product").prototype.save.mockRejectedValueOnce(new Error("DB error"));

        const response = await api
            .post(`${V1}/products`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "test", price: 10 });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("message");
    });
});

describe(`PUT ${V1}/products/:id`, () => {
    test("should return the updated product", async () => {
        const data = { name: "updated", price: 20 };
        mockMongoose.model("Product").findByIdAndUpdate.mockResolvedValueOnce(data);

        const response = await api
            .put(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token")
            .send(data);

        expect(response.status).toBe(200);

        const resultData = response.body.data;
        expect(resultData.name).toBe(data.name);
        expect(resultData.price).toBe(data.price);
    });

    test("should return an error when input is invalid", async () => {
        const response = await api
            .put(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    test("should return 400 when id format is invalid", async () => {
        const response = await api
            .put(`${V1}/products/invalid-id`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "updated", price: 20 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Validation failed");
    });

    test("should return an error when product not found", async () => {
        mockMongoose.model("Product").findByIdAndUpdate.mockResolvedValueOnce(null);

        const response = await api
            .put(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "updated", price: 20 });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("message", "Product not found");
    });
});

describe(`DELETE ${V1}/products/:id`, () => {
    test("should delete a product", async () => {
        const productMock = {
            _id: validMongoId,
            name: "Mocked Product 1",
            price: 100,
        };
        mockMongoose.model("Product").findByIdAndDelete.mockResolvedValueOnce(productMock);

        const response = await api
            .delete(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(200);
    });

    test("should return 400 when id format is invalid", async () => {
        const response = await api
            .delete(`${V1}/products/invalid-id`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Validation failed");
    });

    test("should return an error when product not found", async () => {
        mockMongoose.model("Product").findByIdAndDelete.mockResolvedValueOnce(null);

        const response = await api
            .delete(`${V1}/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Product not found");
    });
});
