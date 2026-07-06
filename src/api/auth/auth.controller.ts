import type { Request, Response } from "express";
import type { z } from "zod";
import { sendResponse } from "../../utils/response.js";
import { registerUser, loginUser } from "../user/user.service.js";
import type { loginSchema } from "./auth.validation.js";

type AuthBody = z.infer<typeof loginSchema>;

export async function registerUserHandler(req: Request<unknown, unknown, AuthBody>, res: Response) {
    const { email, password } = req.body;
    const result = await registerUser({ email, password });
    sendResponse(res, 201, result, "User registered successfully");
}

export async function loginUserHandler(req: Request<unknown, unknown, AuthBody>, res: Response) {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    sendResponse(res, 200, result, "Login successful");
}
