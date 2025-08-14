import Product from "./products.model.js";

export async function createProductDao({ name, price }) {
    const product = new Product({ name, price });
    await product.save();
    return product;
}
export async function getProductsDao() {
    return await Product.find({});
}

export async function updateProductDao({ id, name, price }) {
    return await Product.findByIdAndUpdate(id, { name, price }, { new: true });
}
