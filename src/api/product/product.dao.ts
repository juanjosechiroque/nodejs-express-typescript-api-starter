import { Types } from "mongoose";
import Product from "./product.model.js";
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from "./product.types.js";

export async function createProductDao({ name, price, description }: CreateProductInput) {
    const product = new Product({ name, price, description });
    await product.save();
    return product;
}

export async function getProductsDao({ cursor, limit = 10 }: ListProductsInput = {}) {
    const query = cursor ? { _id: { $gt: new Types.ObjectId(cursor) } } : {};
    const items = await Product.find(query)
        .limit(limit + 1)
        .sort({ _id: 1 })
        .lean();
    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    return { items, hasMore };
}

export async function getProductByIdDao(id: string) {
    return await Product.findById(id).lean();
}

export async function updateProductDao(id: string, update: UpdateProductInput) {
    return await Product.findByIdAndUpdate(id, update, { new: true });
}

export async function deleteProductDao(productId: string) {
    const product = await Product.findByIdAndDelete(productId);
    return product;
}
