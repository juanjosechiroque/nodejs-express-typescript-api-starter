import Joi from "joi";

const mongoIdSchema = Joi.string()
    .length(24)
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
        "string.pattern.base": "Invalid id format",
    });

export const productIdParamSchema = Joi.object().keys({
    id: mongoIdSchema,
});

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
