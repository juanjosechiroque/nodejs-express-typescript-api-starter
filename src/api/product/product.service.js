import { NotFoundError } from "../../errors.js";
import {
    createProductDao,
    getProductsDao,
    getProductByIdDao,
    updateProductDao,
    deleteProductDao,
} from "./product.dao.js";

export async function getProducts({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const { items, total } = await getProductsDao({ skip, limit });
    const totalPages = Math.ceil(total / limit);
    return {
        items,
        pagination: { page, limit, total, totalPages },
    };
}

export async function getProductById(id) {
    const result = await getProductByIdDao(id);
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function createProduct({ name, price, description }) {
    return await createProductDao({ name, price, description });
}

export async function updateProduct({ id, ...fields }) {
    const update = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    const result = await updateProductDao(id, update);
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function deleteProduct(productId) {
    const result = await deleteProductDao(productId);
    if (!result) throw NotFoundError("Product not found");
    return result;
}
