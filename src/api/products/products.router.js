import { Router } from "express";
import {
    getProductsHandler,
    createProductHandler,
    updateProductHandler,
    deleteProductHandler,
} from "./products.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validationMiddleware.js";
import {
    createProductSchema,
    updateProductSchema,
} from "./products.validation.js";

const router = Router();

router.get("/", getProductsHandler);
router.post(
    "/",
    authenticate,
    validate(createProductSchema),
    createProductHandler
);
router.put(
    "/:id",
    authenticate,
    validate(updateProductSchema),
    updateProductHandler
);

router.delete("/:id", authenticate, deleteProductHandler);

export default router;
