import { z } from "zod";

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

export const productIdParamSchema = z.object({
    id: mongoIdSchema,
});

export const createProductSchema = z.object({
    name: z.string().trim().min(1),
    price: z.coerce.number().positive(),
    description: z.string().optional(),
});

export const updateProductSchema = createProductSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });

export const listProductsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
    cursor: mongoIdSchema.optional(),
});
