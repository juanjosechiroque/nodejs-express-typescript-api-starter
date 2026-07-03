export type CreateProductInput = {
    name: string;
    price: number;
    description?: string | undefined;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type ListProductsInput = {
    cursor?: string | undefined;
    limit?: number | undefined;
};
