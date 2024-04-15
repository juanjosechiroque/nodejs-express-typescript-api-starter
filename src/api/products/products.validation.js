import Joi from "joi";

const createProductSchema = Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
});

export const validateProduct = (data) => {
    const { error } = createProductSchema.validate(data, { abortEarly: false });
    if (error) {
        const messages = error.details.map((detail) => detail.message);
        return { valid: false, errors: messages };
    }
    return { valid: true };
};
