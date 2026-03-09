import Joi from "joi";

export const loginSchema = Joi.object().keys({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required(),
});
