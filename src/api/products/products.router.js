import { Router } from "express";
import {
    getProductsHandler,
    createProductHandler,
} from "./products.controller.js";

const router = Router();

router.get("/", getProductsHandler);
router.post("/", createProductHandler);

export default router;
