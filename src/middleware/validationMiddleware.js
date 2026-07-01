import { BadRequestError } from "../errors.js";

function buildValidationError(joiError) {
    const err = BadRequestError("Validation failed");
    err.details = joiError.details.map((detail) => ({
        field: detail.context.key,
        error: detail.message,
    }));
    return err;
}

export function validate(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body ?? {}, { abortEarly: false });
        if (error) return next(buildValidationError(error));
        next();
    };
}

export function validateParams(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.params ?? {}, { abortEarly: false });
        if (error) return next(buildValidationError(error));
        next();
    };
}

export function validateQuery(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query ?? {}, { abortEarly: false });
        if (error) return next(buildValidationError(error));
        req.validatedQuery = value;
        next();
    };
}
