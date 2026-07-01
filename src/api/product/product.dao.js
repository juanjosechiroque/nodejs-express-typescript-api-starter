import { Types } from "mongoose";
import Product from "./product.model.js";

export async function createProductDao({ name, price, description }) {
    const product = new Product({ name, price, description });
    await product.save();
    return product;
}

export async function getProductsDao({ cursor, limit = 10 } = {}) {
    const query = cursor ? { _id: { $gt: new Types.ObjectId(cursor) } } : {};
    const items = await Product.find(query)
        .limit(limit + 1)
        .sort({ _id: 1 })
        .lean();
    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    return { items, hasMore };
}

export async function getProductByIdDao(id) {
    return await Product.findById(id).lean();
}

export async function updateProductDao(id, update) {
    return await Product.findByIdAndUpdate(id, update, { new: true });
}

export async function deleteProductDao(productId) {
    const product = await Product.findByIdAndDelete(productId);
    return product;
}
