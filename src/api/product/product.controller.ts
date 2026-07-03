import type { Request, Response } from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "./product.service.js";

import { sendResponse } from "../../utils/response.js";
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from "./product.types.js";

export async function getProductsHandler(req: Request, res: Response) {
    const query = req.validatedQuery as ListProductsInput;
    const result = await getProducts(query);
    sendResponse(
        res,
        200,
        { items: result.items, pagination: result.pagination },
        "Products retrieved"
    );
}

export async function getProductByIdHandler(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await getProductById(id);
    sendResponse(res, 200, result, "Product retrieved");
}

export async function createProductHandler(req: Request, res: Response) {
    const { name, price, description } = req.body as CreateProductInput;
    const result = await createProduct({ name, price, description });
    sendResponse(res, 201, result, "Product created");
}

export async function updateProductHandler(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const fields = req.body as UpdateProductInput;
    const result = await updateProduct({ id, ...fields });
    sendResponse(res, 200, result, "Product updated");
}

export async function deleteProductHandler(req: Request, res: Response) {
    const productId = (req.params as { id: string }).id;
    const result = await deleteProduct(productId);
    sendResponse(res, 200, result, "Product deleted");
}
