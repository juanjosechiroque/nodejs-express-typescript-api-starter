import { z } from "zod";
import {
    PRODUCT_DESCRIPTION_MAX_LENGTH,
    PRODUCT_NAME_MAX_LENGTH,
    PRODUCT_PRICE_MAX,
    PRODUCT_STOCK_MAX,
} from "./product.constants.js";

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");
export const productStatusSchema = z.enum(["draft", "active", "archived"]);

const booleanSchema = z.preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
}, z.boolean());

const productNameSchema = z.string().trim().min(1).max(PRODUCT_NAME_MAX_LENGTH);
const productPriceSchema = z.coerce.number().positive().max(PRODUCT_PRICE_MAX);
const productStockSchema = z.coerce.number().int().min(0).max(PRODUCT_STOCK_MAX);
const productDescriptionSchema = z.string().trim().max(PRODUCT_DESCRIPTION_MAX_LENGTH);

export const productIdParamSchema = z.object({
    id: mongoIdSchema,
});

export const createProductSchema = z.object({
    name: productNameSchema,
    price: productPriceSchema,
    stock: productStockSchema.default(0),
    status: productStatusSchema.default("draft"),
    isFeatured: booleanSchema.default(false),
    description: productDescriptionSchema.optional(),
});

export const updateProductSchema = z
    .object({
        name: productNameSchema.optional(),
        price: productPriceSchema.optional(),
        stock: productStockSchema.optional(),
        status: productStatusSchema.optional(),
        isFeatured: booleanSchema.optional(),
        description: productDescriptionSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });

export const listProductsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
    cursor: mongoIdSchema.optional(),
    status: productStatusSchema.optional(),
    isFeatured: booleanSchema.optional(),
});
