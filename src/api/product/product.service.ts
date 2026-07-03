import { NotFoundError } from "../../errors.js";
import {
    createProductDao,
    getProductsDao,
    getProductByIdDao,
    updateProductDao,
    deleteProductDao,
} from "./product.dao.js";
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from "./product.types.js";

export async function getProducts({ cursor, limit = 10 }: ListProductsInput = {}) {
    const { items, hasMore } = await getProductsDao({ cursor, limit });
    const lastItem = items.at(-1);
    const nextCursor = hasMore && lastItem ? lastItem._id.toString() : null;
    return {
        items,
        pagination: { limit, nextCursor, hasMore },
    };
}

export async function getProductById(id: string) {
    const result = await getProductByIdDao(id);
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function createProduct({ name, price, description }: CreateProductInput) {
    return await createProductDao({ name, price, description });
}

export async function updateProduct({ id, ...fields }: UpdateProductInput & { id: string }) {
    const update = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    const result = await updateProductDao(id, update);
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function deleteProduct(productId: string) {
    const result = await deleteProductDao(productId);
    if (!result) throw NotFoundError("Product not found");
    return result;
}
