import Joi from "joi";

export const registerUserSchema = Joi.object().keys({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters long",
    }),
});
