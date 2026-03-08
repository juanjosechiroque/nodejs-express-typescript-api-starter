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

export async function createProduct({ name, price, description }) {
    return await createProductDao({ name, price, description });
}

export async function updateProduct({ id, ...fields }) {
    const update = Object.fromEntries(
        Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    const result = await updateProductDao(id, update);
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function deleteProduct(productId) {
    const result = await deleteProductDao(productId);
    if (!result) throw NotFoundError("Product not found");
    return result;
}
