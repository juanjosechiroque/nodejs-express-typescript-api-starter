import { Router } from "express";
import { validate } from "../../middleware/validationMiddleware.js";
import { loginSchema } from "./auth.validation.js";
import { registerUserHandler, loginUserHandler } from "./auth.controller.js";

const router = Router();

router.post("/signup", validate(loginSchema), registerUserHandler);
router.post("/login", validate(loginSchema), loginUserHandler);

export default router;
