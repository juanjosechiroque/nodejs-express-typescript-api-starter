import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
} from "./products.service.js";

import { sendResponse } from "../../utils/response.js";

export async function getProductsHandler(req, res, next) {
    try {
        const result = await getProducts();
        sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function createProductHandler(req, res, next) {
    try {
        const { name, price, description } = req.body;
        const result = await createProduct({ name, price, description });
        sendResponse(res, 201, result);
    } catch (error) {
        next(error);
    }
}

export async function updateProductHandler(req, res, next) {
    try {
        const { id } = req.params;
        const result = await updateProduct({ id, ...req.body });
        sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export async function deleteProductHandler(req, res, next) {
    try {
        const productId = req.params.id;
        const result = await deleteProduct(productId);
        sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
}
