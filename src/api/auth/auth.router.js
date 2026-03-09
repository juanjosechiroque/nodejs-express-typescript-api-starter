import { Router } from "express";
import { validate } from "../../middleware/validationMiddleware.js";
import { registerUserSchema } from "../users/users.validation.js";
import { loginSchema } from "./auth.validation.js";
import { registerUserHandler, loginUserHandler } from "./auth.controller.js";

const router = Router();

router.post("/signup", validate(registerUserSchema), registerUserHandler);
router.post("/login", validate(loginSchema), loginUserHandler);

export default router;
