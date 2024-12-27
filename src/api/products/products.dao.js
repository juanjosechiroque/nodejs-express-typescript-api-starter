import Product from "./products.model.js";

export async function createProductDao({ name, price }) {
    const product = new Product({ name, price });
    await product.save();
    return product;
}
export async function getProductsDao() {
    try {
        return await Product.find({});
    } catch (error) {
        console.log("Error fetching products:", error);
        return null;
    }
}
