import { Router } from "express";

import healthRouter from "./api/health/health.router.js";
import authRouter from "./api/auth/auth.router.js";
import routerProducts from "./api/products/products.router.js";

const router = Router();

router.get("/", (req, res) => res.json({ status: "running" }));

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/products", routerProducts);

export default router;
