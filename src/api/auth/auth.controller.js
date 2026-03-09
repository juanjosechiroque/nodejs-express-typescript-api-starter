import { sendResponse } from "../../utils/response.js";
import { registerUser, loginUser } from "../users/users.service.js";

export async function registerUserHandler(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await registerUser({ email, password });
        sendResponse(res, 201, result);
    } catch (error) {
        next(error);
    }
}

export async function loginUserHandler(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await loginUser({ email, password });
        sendResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
}
