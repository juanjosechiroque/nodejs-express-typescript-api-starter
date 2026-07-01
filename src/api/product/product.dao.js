import Product from "./product.model.js";

export async function createProductDao({ name, price, description }) {
    const product = new Product({ name, price, description });
    await product.save();
    return product;
}
export async function getProductsDao({ skip = 0, limit = 10 } = {}) {
    const [items, total] = await Promise.all([
        Product.find({}).skip(skip).limit(limit).lean(),
        Product.countDocuments({}),
    ]);
    return { items, total };
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
