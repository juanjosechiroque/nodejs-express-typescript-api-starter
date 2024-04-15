import { Router } from "express";
import { getProductsHandler } from "./products.controller.js";

const router = Router();

router.get("/", getProductsHandler);

export default router;
