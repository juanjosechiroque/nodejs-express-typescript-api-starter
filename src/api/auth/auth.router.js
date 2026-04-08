import { Router } from "express";
import { validate } from "../../middleware/validationMiddleware.js";
import { loginSchema } from "./auth.validation.js";
import { registerUserHandler, loginUserHandler } from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.post("/signup", validate(loginSchema), asyncHandler(registerUserHandler));
router.post("/login", validate(loginSchema), asyncHandler(loginUserHandler));

export default router;
