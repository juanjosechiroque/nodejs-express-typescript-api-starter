import {
    createProduct,
    getProducts,
    updateProduct,
} from "./products.service.js";
import { sendResponse } from "../../utils/response.js";
import { NotFoundError } from "../../errors.js";

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
        const { name, price } = req.body;
        const result = await createProduct({ name, price });
        sendResponse(res, 201, result);
    } catch (error) {
        next(error);
    }
}

export async function updateProductHandler(req, res, next) {
    try {
        const { id } = req.params;
        const { name, price } = req.body;

        const result = await updateProduct({ id, name, price });
        if (!result) throw NotFoundError("Product not found");

        sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
}
