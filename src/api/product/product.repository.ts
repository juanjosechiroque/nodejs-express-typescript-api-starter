import { Types, type QueryFilter } from "mongoose";
import Product, { type ProductPersistence } from "./product.model.js";
import { toProductDTO } from "./product.mapper.js";
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from "./product.types.js";

export async function createProduct(input: CreateProductInput) {
    const product = new Product(input);
    await product.save();
    return toProductDTO(product);
}

export async function findProducts({
    cursor,
    limit = 10,
    status,
    isFeatured,
}: ListProductsInput = {}) {
    const query: QueryFilter<ProductPersistence> = {};
    if (cursor) query._id = { $gt: new Types.ObjectId(cursor) };
    if (status) query.status = status;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;

    const items = await Product.find(query)
        .limit(limit + 1)
        .sort({ _id: 1 })
        .lean();
    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    const lastItem = items.at(-1);
    const nextCursor = hasMore && lastItem ? lastItem._id.toString() : null;
    return {
        items: items.map((item) => toProductDTO(item as unknown as ProductPersistence)),
        hasMore,
        nextCursor,
    };
}

export async function findProductById(id: string) {
    const product = await Product.findById(id).lean();
    return product ? toProductDTO(product) : null;
}

export async function updateProductById(id: string, update: UpdateProductInput) {
    const product = await Product.findByIdAndUpdate(id, update, {
        returnDocument: "after",
        runValidators: true,
    }).lean();
    return product ? toProductDTO(product) : null;
}

export async function deleteProductIfNotActive(productId: string) {
    const deleted = await Product.findOneAndDelete({
        _id: productId,
        status: { $ne: "active" },
    });
    return deleted ? toProductDTO(deleted) : null;
}
