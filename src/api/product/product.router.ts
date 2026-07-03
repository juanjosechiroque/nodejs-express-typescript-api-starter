import { Router } from "express";
import {
    getProductsHandler,
    getProductByIdHandler,
    createProductHandler,
    updateProductHandler,
    deleteProductHandler,
} from "./product.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validate, validateParams, validateQuery } from "../../middleware/validationMiddleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
    createProductSchema,
    updateProductSchema,
    productIdParamSchema,
    listProductsQuerySchema,
} from "./product.validation.js";

const router = Router();

router.get("/", validateQuery(listProductsQuerySchema), asyncHandler(getProductsHandler));
router.get("/:id", validateParams(productIdParamSchema), asyncHandler(getProductByIdHandler));
router.post("/", authenticate, validate(createProductSchema), asyncHandler(createProductHandler));
router.put(
    "/:id",
    authenticate,
    validateParams(productIdParamSchema),
    validate(updateProductSchema),
    asyncHandler(updateProductHandler)
);

router.delete(
    "/:id",
    authenticate,
    validateParams(productIdParamSchema),
    asyncHandler(deleteProductHandler)
);

export default router;
