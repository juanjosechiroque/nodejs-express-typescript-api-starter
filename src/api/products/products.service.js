export function getProducts() {
    return "GET /products";
}

export function createProduct(name, price) {
    const result = {
        name,
        price,
    };
    return result;
}
