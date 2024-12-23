import { jest } from "@jest/globals";

jest.unstable_mockModule("../api/products/products.dao.js", () => ({
    createProductDao: jest.fn().mockReturnValue({ name: "test", price: 10 }),
    getProductsDao: jest.fn().mockResolvedValue([
        { id: 1, name: "Mocked Product 1", price: 10 },
        { id: 2, name: "Mocked Product 2", price: 20 },
    ]),
}));

const { api } = await import("./helpers.js");

describe("GET /products", () => {
    test("should return a list of products", async () => {
        const response = await api.get("/products");
        expect(response.status).toBe(200);
    });
});

describe("POST /products", () => {
    test("should return a new product", async () => {
        const data = { name: "test", price: 10 };

        const response = await api.post("/products").send(data);

        expect(response.status).toBe(201);
        const resultData = response.body.data;
        expect(resultData.name).toBe(data.name);
        expect(resultData.price).toBe(data.price);
    });

    test("should return an error when input is invalid", async () => {
        const response = await api.post("/products");

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });
});
