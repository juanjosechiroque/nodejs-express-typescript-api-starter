import express from "express";
import { healthCheck } from "./health.controller.js";

const router = express.Router();

router.get("/", healthCheck);

export default router;
