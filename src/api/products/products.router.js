import { Router } from "express";
import {
    getProductsHandler,
    getProductByIdHandler,
    createProductHandler,
    updateProductHandler,
    deleteProductHandler,
} from "./products.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validate, validateParams, validateQuery } from "../../middleware/validationMiddleware.js";
import {
    createProductSchema,
    updateProductSchema,
    productIdParamSchema,
    listProductsQuerySchema,
} from "./products.validation.js";

const router = Router();

router.get("/", validateQuery(listProductsQuerySchema), getProductsHandler);
router.get("/:id", validateParams(productIdParamSchema), getProductByIdHandler);
router.post("/", authenticate, validate(createProductSchema), createProductHandler);
router.put(
    "/:id",
    authenticate,
    validateParams(productIdParamSchema),
    validate(updateProductSchema),
    updateProductHandler
);

router.delete("/:id", authenticate, validateParams(productIdParamSchema), deleteProductHandler);

export default router;
