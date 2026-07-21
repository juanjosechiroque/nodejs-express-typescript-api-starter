import type { ProductPersistence } from "./product.model.js";
import type { ProductDTO } from "./product.types.js";

export function toProductDTO(product: ProductPersistence): ProductDTO {
    const dto: ProductDTO = {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        stock: product.stock,
        status: product.status,
        isFeatured: product.isFeatured,
        createdAt: product.created_at.toISOString(),
        updatedAt: product.updated_at.toISOString(),
    };

    if (typeof product.description === "string") {
        dto.description = product.description;
    }

    return dto;
}
