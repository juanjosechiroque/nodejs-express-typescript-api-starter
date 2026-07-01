import { sendResponse } from "../../utils/response.js";
import { registerUser, loginUser } from "../user/user.service.js";

export async function registerUserHandler(req, res) {
    const { email, password } = req.body;
    const result = await registerUser({ email, password });
    sendResponse(res, 201, result, "User registered successfully");
}

export async function loginUserHandler(req, res) {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    sendResponse(res, 200, result, "Login successful");
}
