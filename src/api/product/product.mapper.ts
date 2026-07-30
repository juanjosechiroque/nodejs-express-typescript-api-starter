import type { ProductDocument } from "./product.model.js";

export type ProductDto = {
    id: string;
    name: string;
    description?: string | undefined;
    price: number;
    stock: number;
    status: "draft" | "active" | "archived";
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type ProductRecord = ProductDocument & {
    _id: { toString: () => string };
};

export function toProductDto(product: ProductRecord): ProductDto {
    return {
        id: product._id.toString(),
        name: product.name,
        description: product.description ?? undefined,
        price: product.price,
        stock: product.stock,
        status: product.status,
        isFeatured: product.isFeatured,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
}
