import { createProductDao, getProductsDao } from "./products.dao.js";

export async function getProducts() {
    const result = await getProductsDao();
    return result;
}

export async function createProduct({ name, price }) {
    return await createProductDao({ name, price });
}
