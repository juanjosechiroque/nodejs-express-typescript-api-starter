import { BadRequestError } from "../../errors.js";
import { validateRegisterUser } from "./users.validation.js";
import { registerUser } from "./users.service.js";
import { sendResponse } from "../../utils/response.js";

export async function registerUserHandler(req, res, next) {
    const { email, password } = req.body;

    try {
        const registerUserValidations = validateRegisterUser({
            email,
            password,
        });

        if (!registerUserValidations.valid)
            throw BadRequestError(registerUserValidations.errors);

        const result = await registerUser({ email, password });
        sendResponse(res, 201, result);
    } catch (error) {
        next(error);
    }
}
