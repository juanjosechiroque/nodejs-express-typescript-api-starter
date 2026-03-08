import Joi from "joi";

export const createProductSchema = Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    description: Joi.string().allow("").optional(),
});

export const updateProductSchema = Joi.object()
    .keys({
        name: Joi.string().optional(),
        price: Joi.number().positive().optional(),
        description: Joi.string().allow("").optional(),
    })
    .min(1);
