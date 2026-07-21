import { MongoDBContainer, type StartedMongoDBContainer } from "@testcontainers/mongodb";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let container: StartedMongoDBContainer;
let connectDB: typeof import("../../database.js").connectDB;
let disconnectDB: typeof import("../../database.js").disconnectDB;
let Product: typeof import("../../api/product/product.model.js").default;
let User: typeof import("../../api/user/user.model.js").default;
let productRepository: typeof import("../../api/product/product.repository.js");

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
});

beforeEach(async () => {
    await Promise.all([Product.deleteMany({}), User.deleteMany({})]);
});

afterAll(async () => {
    await disconnectDB();
    await container.stop();
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
});
