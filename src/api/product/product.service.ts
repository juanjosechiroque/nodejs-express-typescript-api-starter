import { BadRequestError, NotFoundError } from "../../errors.js";
import {
    createProductDao,
    getProductsDao,
    getProductByIdDao,
    updateProductDao,
    deleteProductDao,
} from "./product.dao.js";
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from "./product.types.js";

export async function getProducts({
    cursor,
    limit = 10,
    status,
    isFeatured,
}: ListProductsInput = {}) {
    const { items, hasMore } = await getProductsDao({ cursor, limit, status, isFeatured });
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

export async function createProduct(input: CreateProductInput) {
    return await createProductDao(input);
}

export async function updateProduct({ id, ...fields }: UpdateProductInput & { id: string }) {
    const update = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    const result = await updateProductDao(id, update);
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function deleteProduct(productId: string) {
    const product = await getProductByIdDao(productId);
    if (!product) throw NotFoundError("Product not found");
    if (product.status === "active") {
        throw BadRequestError("Active products must be archived before deletion");
    }
    return await deleteProductDao(productId);
}
