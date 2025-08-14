import { Router } from "express";
import {
    getProductsHandler,
    createProductHandler,
    updateProductHandler,
} from "./products.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validationMiddleware.js";
import { updateProductSchema } from "./products.validation.js";

const router = Router();

router.get("/", getProductsHandler);
router.post(
    "/",
    authenticate,
    validate(updateProductSchema),
    createProductHandler
);
router.put(
    "/:id",
    authenticate,
    validate(updateProductSchema),
    updateProductHandler
);

export default router;
