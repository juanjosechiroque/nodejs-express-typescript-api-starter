import { BadRequestError } from "../../errors.js";
import { createProduct, getProducts } from "./products.service.js";
import { validateProduct } from "./products.validation.js";

export function getProductsHandler(req, res) {
    const result = getProducts();
    res.json({ message: result });
}

export function createProductHandler(req, res, next) {
    const { name, price } = req.body;

    try {
        const productValidation = validateProduct({ name, price });
        if (!productValidation.valid)
            throw BadRequestError(productValidation.errors);

        const result = createProduct(name, price);
        res.status(201).send({ data: result });
    } catch (error) {
        next(error);
    }
}
