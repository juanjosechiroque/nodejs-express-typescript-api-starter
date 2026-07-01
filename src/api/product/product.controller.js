import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "./product.service.js";

import { sendResponse } from "../../utils/response.js";

export async function getProductsHandler(req, res) {
    const { cursor, limit } = req.validatedQuery;
    const result = await getProducts({ cursor, limit });
    sendResponse(
        res,
        200,
        { items: result.items, pagination: result.pagination },
        "Products retrieved"
    );
}

export async function getProductByIdHandler(req, res) {
    const { id } = req.params;
    const result = await getProductById(id);
    sendResponse(res, 200, result, "Product retrieved");
}

export async function createProductHandler(req, res) {
    const { name, price, description } = req.body;
    const result = await createProduct({ name, price, description });
    sendResponse(res, 201, result, "Product created");
}

export async function updateProductHandler(req, res) {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const result = await updateProduct({ id, name, price, description });
    sendResponse(res, 200, result, "Product updated");
}

export async function deleteProductHandler(req, res) {
    const productId = req.params.id;
    const result = await deleteProduct(productId);
    sendResponse(res, 200, result, "Product deleted");
}
