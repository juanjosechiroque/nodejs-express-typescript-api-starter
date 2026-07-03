import { Types } from "mongoose";
import Product from "./product.model.js";
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from "./product.types.js";

export async function createProduct(input: CreateProductInput) {
    const product = new Product(input);
    await product.save();
    return product;
}

export async function findProducts({
    cursor,
    limit = 10,
    status,
    isFeatured,
}: ListProductsInput = {}) {
    const query: Record<string, unknown> = {};
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
    return { items, hasMore, nextCursor };
}

export async function findProductById(id: string) {
    return await Product.findById(id).lean();
}

export async function updateProductById(id: string, update: UpdateProductInput) {
    return await Product.findByIdAndUpdate(id, update, { new: true }).lean();
}

export async function deleteProductIfNotActive(productId: string) {
    const deleted = await Product.findOneAndDelete({
        _id: productId,
        status: { $ne: "active" },
    });
    return deleted;
}
