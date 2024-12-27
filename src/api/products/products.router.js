import { Router } from "express";
import {
    getProductsHandler,
    createProductHandler,
} from "./products.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = Router();

router.get("/", getProductsHandler);
router.post("/", authenticate, createProductHandler);

export default router;
