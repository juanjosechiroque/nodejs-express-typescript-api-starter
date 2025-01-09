import { BadRequestError } from "../../errors.js";
import { createProduct, getProducts } from "./products.service.js";
import { validateProduct } from "./products.validation.js";

export async function getProductsHandler(req, res, next) {
    try {
        const result = await getProducts();
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
}

export async function createProductHandler(req, res, next) {
    const { name, price } = req.body;

    try {
        const productValidation = validateProduct({ name, price });
        if (!productValidation.valid)
            throw BadRequestError(productValidation.errors);

        const result = await createProduct({ name, price });
        res.status(201).send({ data: result });
    } catch (error) {
        next(error);
    }
}
