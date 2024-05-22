import { api } from "./helpers.js";

describe("GET /products", () => {
    test("should return a list of products", async () => {
        const response = await api.get("/products");
        expect(response.status).toBe(200);
    });
});

describe("POST /products", () => {
    test("should return a new product", async () => {
        const data = {
            name: "test",
            price: 10,
        };
        const response = await api.post("/products").send(data);
        expect(response.status).toBe(201);
    });

    test("should an error when input is invalid", async () => {
        const response = await api.post("/products");
        expect(response.status).toBe(400);
    });
});
