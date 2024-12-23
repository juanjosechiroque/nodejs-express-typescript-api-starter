import { BadRequestError } from "../../errors.js";
import { validateRegisterUser } from "./users.validation.js";
import { registerUser } from "./users.service.js";

export async function registerUserHandler(req, res, next) {
    const { email, password } = req.body;

    try {
        const productValidation = validateRegisterUser({ email, password });
        if (!productValidation.valid)
            throw BadRequestError(productValidation.errors);

        const result = await registerUser({ email, password });
        res.status(201).send({ data: result });
    } catch (error) {
        next(error);
    }
}
