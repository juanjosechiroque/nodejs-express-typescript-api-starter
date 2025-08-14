import { NotFoundError } from "../../errors.js";
import {
    createProductDao,
    getProductsDao,
    updateProductDao,
    deleteProductDao,
} from "./products.dao.js";

export async function getProducts() {
    const result = await getProductsDao();
    return result;
}

export async function createProduct({ name, price }) {
    return await createProductDao({ name, price });
}

export async function updateProduct({ id, name, price }) {
    const result = await updateProductDao({ id, name, price });
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function deleteProduct(productId) {
    const result = await deleteProductDao(productId);
    if (!result) throw NotFoundError("Product not found");
    return result;
}
