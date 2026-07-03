import type { Request, Response } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "./product.service.js";

import { sendResponse } from "../../utils/response.js";
import type {
    CreateProductInput,
    ListProductsInput,
    ProductIdParams,
    UpdateProductInput,
} from "./product.types.js";

type RequestWithValidatedQuery<T> = Request & { validatedQuery: T };

export async function getProductsHandler(
    req: RequestWithValidatedQuery<ListProductsInput>,
    res: Response
) {
    const result = await getProducts(req.validatedQuery);
    sendResponse(
        res,
        200,
        { items: result.items, pagination: result.pagination },
        "Products retrieved"
    );
}

export async function getProductByIdHandler(req: Request<ProductIdParams>, res: Response) {
    const { id } = req.params;
    const result = await getProductById(id);
    sendResponse(res, 200, result, "Product retrieved");
}

export async function createProductHandler(
    req: Request<unknown, unknown, CreateProductInput>,
    res: Response
) {
    const result = await createProduct(req.body);
    sendResponse(res, 201, result, "Product created");
}

export async function updateProductHandler(
    req: Request<ProductIdParams, unknown, UpdateProductInput>,
    res: Response
) {
    const { id } = req.params;
    const result = await updateProduct({ id, ...req.body });
    sendResponse(res, 200, result, "Product updated");
}

export async function deleteProductHandler(req: Request<ProductIdParams>, res: Response) {
    const result = await deleteProduct(req.params.id);
    sendResponse(res, 200, result, "Product deleted");
}
