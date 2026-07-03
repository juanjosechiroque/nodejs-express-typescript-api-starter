import type { z } from "zod";
import {
    createProductSchema,
    listProductsQuerySchema,
    productIdParamSchema,
    updateProductSchema,
} from "./product.validation.js";

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsInput = Partial<z.infer<typeof listProductsQuerySchema>>;
export type ProductIdParams = z.infer<typeof productIdParamSchema>;
