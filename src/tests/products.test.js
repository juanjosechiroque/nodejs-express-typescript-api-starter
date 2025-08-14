import { jest } from "@jest/globals";
import mockMongoose from "./jest-mongoose-mock.js";

jest.mock("mongoose", () => ({
    __esModule: true,
    ...mockMongoose,
}));

jest.unstable_mockModule("../utils/jwt.js", () => ({
    generateToken: jest.fn(),
    verifyToken: jest.fn((token) => {
        if (token === "valid-token") {
            return { id: 1, name: "Mock User" };
        }
        throw new Error("Token inválido o expirado");
    }),
}));

const { api } = await import("./helpers.js");

describe("GET /products", () => {
    test("should return a list of products", async () => {
        const productsMock = [
            { _id: "1", name: "Mocked Product 1", price: 100 },
            { _id: "2", name: "Mocked Product 2", price: 200 },
        ];
        mockMongoose.model("Product").find.mockResolvedValue(productsMock);

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

describe("PUT /products/:id", () => {
    test("should return the updated product", async () => {
        const data = { name: "updated", price: 20 };
        mockMongoose
            .model("Product")
            .findByIdAndUpdate.mockResolvedValueOnce(data);

        const response = await api
            .put("/products/123")
            .set("Authorization", "Bearer valid-token")
            .send(data);

        expect(response.status).toBe(200);

        const resultData = response.body.data;
        expect(resultData.name).toBe(data.name);
        expect(resultData.price).toBe(data.price);
    });

    test("should return an error when input is invalid", async () => {
        const response = await api
            .put("/products/123")
            .set("Authorization", "Bearer valid-token");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });

    test("should return an error when product not found", async () => {
        mockMongoose
            .model("Product")
            .findByIdAndUpdate.mockResolvedValueOnce(null);

        const response = await api
            .put("/products/123")
            .set("Authorization", "Bearer valid-token")
            .send({ name: "updated", price: 20 });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Product not found");
    });
});
