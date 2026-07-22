import { MongoDBContainer, type StartedMongoDBContainer } from "@testcontainers/mongodb";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let container: StartedMongoDBContainer;
let connectDB: typeof import("../../database.js").connectDB;
let disconnectDB: typeof import("../../database.js").disconnectDB;
let Product: typeof import("../../api/product/product.model.js").default;
let User: typeof import("../../api/user/user.model.js").default;
let productRepository: typeof import("../../api/product/product.repository.js");
let api: ReturnType<typeof request>;

beforeAll(async () => {
    container = await new MongoDBContainer("mongo:8.0").start();

    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = `${container.getConnectionString()}/api_starter_integration?directConnection=true`;
    process.env.JWT_SECRET = "integration-test-jwt-secret-at-least-32-chars";

    ({ connectDB, disconnectDB } = await import("../../database.js"));
    Product = (await import("../../api/product/product.model.js")).default;
    User = (await import("../../api/user/user.model.js")).default;
    productRepository = await import("../../api/product/product.repository.js");

    await connectDB();
    await Promise.all([Product.init(), User.init()]);
    api = request((await import("../../app.js")).default);
});

beforeEach(async () => {
    await Promise.all([Product.deleteMany({}), User.deleteMany({})]);
});

afterAll(async () => {
    if (disconnectDB) {
        await disconnectDB();
    }

    if (container) {
        await container.stop();
    }
});

describe("MongoDB integration", () => {
    it("persists product defaults and enforces model validators on updates", async () => {
        const product = await Product.create({ name: "  Integration Product  ", price: 25 });

        expect(product.name).toBe("Integration Product");
        expect(product.stock).toBe(0);
        expect(product.status).toBe("draft");
        expect(product.isFeatured).toBe(false);

        await expect(
            productRepository.updateProductById(product.id, { name: "x".repeat(121) })
        ).rejects.toMatchObject({ name: "ValidationError" });
    });

    it("applies filters and continues cursor pagination against MongoDB", async () => {
        await Product.create([
            { name: "Product A", price: 10, status: "active", isFeatured: false },
            { name: "Product B", price: 20, status: "active", isFeatured: false },
            { name: "Product C", price: 30, status: "active", isFeatured: false },
            { name: "Featured Product", price: 40, status: "active", isFeatured: true },
        ]);

        const firstPage = await productRepository.findProducts({
            limit: 2,
            status: "active",
            isFeatured: false,
        });

        expect(firstPage.items).toHaveLength(2);
        expect(firstPage.hasMore).toBe(true);
        expect(firstPage.nextCursor).toBeTruthy();

        const secondPage = await productRepository.findProducts({
            cursor: firstPage.nextCursor ?? undefined,
            limit: 2,
            status: "active",
            isFeatured: false,
        });

        expect(secondPage.items).toHaveLength(1);
        expect(secondPage.hasMore).toBe(false);
        expect(secondPage.items[0]?.name).toBe("Product C");
    });

    it("hashes passwords and excludes them from serialized users", async () => {
        const user = await User.create({
            email: "Integration@Example.com",
            password: "IntegrationPassword123!",
        });

        expect(user.email).toBe("integration@example.com");
        expect(user.password).not.toBe("IntegrationPassword123!");
        expect(user.password).toMatch(/^\$2[aby]\$/);
        expect(user.toJSON()).not.toHaveProperty("password");
    });

    it("enforces the unique email index", async () => {
        await User.create({ email: "duplicate@example.com", password: "Password123!" });

        await expect(
            User.create({ email: "DUPLICATE@example.com", password: "Password123!" })
        ).rejects.toMatchObject({ code: 11000 });
    });

    it("returns the same Product DTO contract from create, list, get, and patch", async () => {
        const signupResponse = await api.post("/v1/auth/signup").send({
            email: "contract@example.com",
            password: "ContractPassword123!",
        });
        expect(signupResponse.status).toBe(201);
        const token = signupResponse.body.data as string;

        const createResponse = await api
            .post("/v1/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Contract Product",
                description: "Product DTO integration test",
                price: 49.99,
                stock: 5,
                status: "active",
                isFeatured: true,
            });

        expect(createResponse.status).toBe(201);
        expectProductContract(createResponse.body.data);
        const productId = createResponse.body.data.id as string;

        const listResponse = await api.get("/v1/products");
        expect(listResponse.status).toBe(200);
        expectProductContract(listResponse.body.data.items[0]);
        expect(listResponse.body.data.items[0].id).toBe(productId);

        const getResponse = await api.get(`/v1/products/${productId}`);
        expect(getResponse.status).toBe(200);
        expectProductContract(getResponse.body.data);
        expect(getResponse.body.data.id).toBe(productId);

        const patchResponse = await api
            .patch(`/v1/products/${productId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Updated Contract Product" });
        expect(patchResponse.status).toBe(200);
        expectProductContract(patchResponse.body.data);
        expect(patchResponse.body.data).toMatchObject({
            id: productId,
            name: "Updated Contract Product",
        });
    });
});

function expectProductContract(product: unknown) {
    expect(product).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{24}$/),
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        stock: expect.any(Number),
        status: expect.stringMatching(/^(draft|active|archived)$/),
        isFeatured: expect.any(Boolean),
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
    expect(product).not.toHaveProperty("_id");
    expect(product).not.toHaveProperty("__v");
    expect(product).not.toHaveProperty("created_at");
    expect(product).not.toHaveProperty("updated_at");
}
