import { Router } from "express";
import { healthCheckHandler } from "./health.controller.js";

const router = Router();

router.get("/", healthCheckHandler);

export default router;
