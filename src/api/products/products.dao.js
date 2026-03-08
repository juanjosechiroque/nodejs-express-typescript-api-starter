import Product from "./products.model.js";

export async function createProductDao({ name, price, description }) {
    const product = new Product({ name, price, description });
    await product.save();
    return product;
}
export async function getProductsDao() {
    return await Product.find({});
}

export async function updateProductDao(id, update) {
    return await Product.findByIdAndUpdate(id, update, { new: true });
}

export async function deleteProductDao(productId) {
    const product = await Product.findByIdAndDelete(productId);
    return product;
}
