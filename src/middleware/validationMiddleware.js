import { BadRequestError } from "../errors.js";

export function validate(schema) {
    return (req, res, next) => {
        const body = req.body ?? {};
        const { error } = schema.validate(body, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map((detail) => ({
                field: detail.context.key,
                error: detail.message,
            }));
            const err = BadRequestError("Validation failed");
            err.details = validationErrors;
            return next(err);
        }
        next();
    };
}

export function validateParams(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.params ?? {}, {
            abortEarly: false,
        });
        if (error) {
            const validationErrors = error.details.map((detail) => ({
                field: detail.context.key,
                error: detail.message,
            }));
            const err = BadRequestError("Validation failed");
            err.details = validationErrors;
            return next(err);
        }
        next();
    };
}

export function validateQuery(schema) {
    return (req, res, next) => {
        const query = req.query ?? {};
        const { error, value } = schema.validate(query, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map((detail) => ({
                field: detail.context.key,
                error: detail.message,
            }));
            const err = BadRequestError("Validation failed");
            err.details = validationErrors;
            return next(err);
        }
        req.validatedQuery = value;
        next();
    };
}
