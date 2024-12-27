import { Router } from "express";
import { registerUserHandler } from "./users.controller.js";

const router = Router();

router.post("/signup", registerUserHandler);

export default router;
