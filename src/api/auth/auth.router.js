import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validationMiddleware.js";
import { loginSchema } from "./auth.validation.js";
import { registerUserHandler, loginUserHandler } from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        code: "TooManyRequests",
        message: "Too many attempts, please try again later",
    },
});

router.post("/signup", authRateLimit, validate(loginSchema), asyncHandler(registerUserHandler));
router.post("/login", authRateLimit, validate(loginSchema), asyncHandler(loginUserHandler));

export default router;
