import { z } from "zod";

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");
export const productStatusSchema = z.enum(["draft", "active", "archived"]);

export const productIdParamSchema = z.object({
    id: mongoIdSchema,
});

export const createProductSchema = z.object({
    name: z.string().trim().min(1),
    price: z.coerce.number().positive(),
    stock: z.coerce.number().int().min(0).default(0),
    status: productStatusSchema.default("draft"),
    isFeatured: z.coerce.boolean().default(false),
    description: z.string().optional(),
});

export const updateProductSchema = z
    .object({
        name: z.string().trim().min(1).optional(),
        price: z.coerce.number().positive().optional(),
        stock: z.coerce.number().int().min(0).optional(),
        status: productStatusSchema.optional(),
        isFeatured: z.coerce.boolean().optional(),
        description: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });

export const listProductsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
    cursor: mongoIdSchema.optional(),
    status: productStatusSchema.optional(),
    isFeatured: z.coerce.boolean().optional(),
});
