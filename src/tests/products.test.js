import mockMongoose from "./jest-mongoose-mock.js";

const { api } = await import("./helpers.js");

describe("GET /products", () => {
    test("should return a list of products", async () => {
        const productsMock = [
            { _id: "1", name: "Mocked Product 1", price: 100 },
            { _id: "2", name: "Mocked Product 2", price: 200 },
        ];
        mockMongoose.model("Product").find.mockResolvedValueOnce(productsMock);

        const response = await api.get("/products");

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(productsMock.length);
    });
});

describe("POST /products", () => {
    test("should return a new product", async () => {
        const data = { name: "test", price: 10 };
        mockMongoose.model("Product").find.mockResolvedValueOnce(data);

        const response = await api
            .post("/products")
            .set("Authorization", "Bearer valid-token")
            .send(data);

        expect(response.status).toBe(201);

        const resultData = response.body.data;
        expect(resultData.name).toBe(data.name);
        expect(resultData.price).toBe(data.price);
    });

    test("should return an error when input is invalid", async () => {
        const response = await api
            .post("/products")
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    test("should return an error when token is unauthorized", async () => {
        const response = await api
            .post("/products")
            .set("Authorization", "random token");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
            "message",
            "Authorization header missing or invalid"
        );
    });

    test("should return an error when token is empty", async () => {
        const response = await api
            .post("/products")
            .set("Authorization", "Bearer ");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Access denied");
    });

    test("should return an error when token is invalid", async () => {
        const response = await api
            .post("/products")
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty(
            "message",
            "Invalid or expired token"
        );
    });
});

const validMongoId = "507f1f77bcf86cd799439011";

describe("PUT /products/:id", () => {
    test("should return the updated product", async () => {
        const data = { name: "updated", price: 20 };
        mockMongoose
            .model("Product")
            .findByIdAndUpdate.mockResolvedValueOnce(data);

        const response = await api
            .put(`/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token")
            .send(data);

        expect(response.status).toBe(200);

        const resultData = response.body.data;
        expect(resultData.name).toBe(data.name);
        expect(resultData.price).toBe(data.price);
    });

    test("should return an error when input is invalid", async () => {
        const response = await api
            .put(`/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    test("should return 400 when id format is invalid", async () => {
        const response = await api
            .put("/products/invalid-id")
            .set("Authorization", "Bearer valid-token")
            .send({ name: "updated", price: 20 });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Validation failed");
    });

    test("should return an error when product not found", async () => {
        mockMongoose
            .model("Product")
            .findByIdAndUpdate.mockResolvedValueOnce(null);

        const response = await api
            .put(`/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token")
            .send({ name: "updated", price: 20 });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("code");
        expect(response.body).toHaveProperty("message", "Product not found");
    });
});

describe("DELETE /products/:id", () => {
    test("should delete a product", async () => {
        const productMock = {
            _id: validMongoId,
            name: "Mocked Product 1",
            price: 100,
        };
        mockMongoose
            .model("Product")
            .findByIdAndDelete.mockResolvedValueOnce(productMock);

        const response = await api
            .delete(`/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(200);
    });

    test("should return 400 when id format is invalid", async () => {
        const response = await api
            .delete("/products/invalid-id")
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Validation failed");
    });

    test("should return an error when product not found", async () => {
        mockMongoose
            .model("Product")
            .findByIdAndDelete.mockResolvedValueOnce(null);

        const response = await api
            .delete(`/products/${validMongoId}`)
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Product not found");
    });
});
