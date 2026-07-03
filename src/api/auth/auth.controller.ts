import type { Request, Response } from "express";
import { sendResponse } from "../../utils/response.js";
import { registerUser, loginUser } from "../user/user.service.js";
import type { UserCredentials } from "../user/user.types.js";

export async function registerUserHandler(req: Request, res: Response) {
    const { email, password } = req.body as UserCredentials;
    const result = await registerUser({ email, password });
    sendResponse(res, 201, result, "User registered successfully");
}

export async function loginUserHandler(req: Request, res: Response) {
    const { email, password } = req.body as UserCredentials;
    const result = await loginUser({ email, password });
    sendResponse(res, 200, result, "Login successful");
}
