import { BadRequestError, NotFoundError } from "../../errors.js";
import * as productRepository from "./product.repository.js";
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from "./product.types.js";

export async function getProducts({
    cursor,
    limit = 10,
    status,
    isFeatured,
}: ListProductsInput = {}) {
    const { items, hasMore, nextCursor } = await productRepository.findProducts({
        cursor,
        limit,
        status,
        isFeatured,
    });
    return {
        items,
        pagination: { limit, nextCursor, hasMore },
    };
}

export async function getProductById(id: string) {
    const result = await productRepository.findProductById(id);
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function createProduct(input: CreateProductInput) {
    return await productRepository.createProduct(input);
}

export async function updateProduct({ id, ...fields }: UpdateProductInput & { id: string }) {
    const update = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    const result = await productRepository.updateProductById(id, update);
    if (!result) throw NotFoundError("Product not found");
    return result;
}

export async function deleteProduct(productId: string) {
    const exists = await productRepository.findProductById(productId);
    if (!exists) throw NotFoundError("Product not found");
    if (exists.status === "active") {
        throw BadRequestError("Active products must be archived before deletion");
    }
    const result = await productRepository.deleteProductIfNotActive(productId);
    if (!result) {
        throw BadRequestError("Active products must be archived before deletion");
    }
    return result;
}
