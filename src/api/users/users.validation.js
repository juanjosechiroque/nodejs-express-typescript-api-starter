import Joi from "joi";

export const registerUserSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});
