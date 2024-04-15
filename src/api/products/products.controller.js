import { createProduct, getProducts } from "./products.service.js";

export function getProductsHandler(req, res) {
    const result = getProducts();
    res.json({ message: result });
}

export function createProductHandler(req, res) {
    const result = createProduct();
    res.json({ message: result });
}
