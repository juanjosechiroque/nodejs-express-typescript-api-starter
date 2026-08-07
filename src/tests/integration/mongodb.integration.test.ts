import mongoose, { Types } from "mongoose";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import Product from "../../api/product/product.model.js";
import {
    deleteProductIfNotActive,
    findProducts,
    updateProductById,
} from "../../api/product/product.repository.js";
import User from "../../api/user/user.model.js";
import { createUser, findUserByEmail } from "../../api/user/user.repository.js";

const DATABASE_NAME = "api_starter_integration";

const productIds = [
    "000000000000000000000001",
    "000000000000000000000002",
    "000000000000000000000003",
    "000000000000000000000004",
] as const;

beforeAll(async () => {
    await mongoose.connect(inject("mongoUri"), {
        dbName: DATABASE_NAME,
        directConnection: true,
    });
    await Promise.all([Product.syncIndexes(), User.syncIndexes()]);
});

afterEach(async () => {
    await Promise.all([Product.deleteMany({}), User.deleteMany({})]);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

describe("MongoDB integration", () => {
    describe("User persistence", () => {
        it("creates the unique email index and rejects a duplicate email", async () => {
            const indexes = await User.collection.indexes();
            expect(indexes).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ key: { email: 1 }, unique: true }),
                ])
            );

            await createUser({ email: "duplicate@example.com", password: "test-password" });

            await expect(
                createUser({ email: "duplicate@example.com", password: "another-password" })
            ).rejects.toMatchObject({ code: 11000 });
        });

        it("runs the Mongoose password hook and reads the stored user", async () => {
            await createUser({ email: "USER@EXAMPLE.COM", password: "plain-password" });

            const storedUser = await findUserByEmail({ email: "user@example.com" });

            expect(storedUser).toMatchObject({
                email: "user@example.com",
                status: "active",
            });
            expect(storedUser?.password).not.toBe("plain-password");
            expect(storedUser?.password).toMatch(/^\$2[aby]\$/);
        });
    });

    describe("Product indexes and queries", () => {
        beforeEach(async () => {
            await Product.insertMany([
                {
                    _id: new Types.ObjectId(productIds[0]),
                    name: "Featured active",
                    price: 10,
                    stock: 5,
                    status: "active",
                    isFeatured: true,
                },
                {
                    _id: new Types.ObjectId(productIds[1]),
                    name: "Regular active one",
                    price: 20,
                    stock: 5,
                    status: "active",
                    isFeatured: false,
                },
                {
                    _id: new Types.ObjectId(productIds[2]),
                    name: "Archived",
                    price: 30,
                    stock: 5,
                    status: "archived",
                    isFeatured: false,
                },
                {
                    _id: new Types.ObjectId(productIds[3]),
                    name: "Regular active two",
                    price: 40,
                    stock: 5,
                    status: "active",
                    isFeatured: false,
                },
            ]);
        });

        it("creates the compound list-query index", async () => {
            const indexes = await Product.collection.indexes();

            expect(indexes).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        key: { status: 1, isFeatured: 1, _id: 1 },
                    }),
                ])
            );
        });

        it("paginates by ObjectId cursor without duplicates", async () => {
            const firstPage = await findProducts({ limit: 2 });

            expect(firstPage.items.map((item) => item._id.toString())).toEqual(
                productIds.slice(0, 2)
            );
            expect(firstPage).toMatchObject({
                hasMore: true,
                nextCursor: productIds[1],
            });

            const secondPage = await findProducts({
                limit: 2,
                cursor: firstPage.nextCursor ?? undefined,
            });

            expect(secondPage.items.map((item) => item._id.toString())).toEqual(
                productIds.slice(2)
            );
            expect(secondPage).toMatchObject({ hasMore: false, nextCursor: null });
        });

        it("combines status and isFeatured filters in MongoDB", async () => {
            const result = await findProducts({
                limit: 10,
                status: "active",
                isFeatured: false,
            });

            expect(result.items.map((item) => item._id.toString())).toEqual([
                productIds[1],
                productIds[3],
            ]);
        });

        it("returns the updated document and only deletes non-active products", async () => {
            const updated = await updateProductById(productIds[2], {
                name: "Updated archived product",
                stock: 12,
            });
            expect(updated).toMatchObject({
                name: "Updated archived product",
                stock: 12,
            });

            const activeDelete = await deleteProductIfNotActive(productIds[0]);
            expect(activeDelete).toBeNull();

            const archivedDelete = await deleteProductIfNotActive(productIds[2]);
            expect(archivedDelete?._id.toString()).toBe(productIds[2]);
            await expect(Product.countDocuments()).resolves.toBe(3);
        });
    });
});
