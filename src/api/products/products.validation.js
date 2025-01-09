import Joi from "joi";

export const createProductSchema = Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
});
