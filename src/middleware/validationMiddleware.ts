import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Schema, ValidationError } from "joi";
import { BadRequestError } from "../errors.js";

function buildValidationError(joiError: ValidationError) {
    const err = BadRequestError("Validation failed");
    err.details = joiError.details.map((detail) => ({
        field: detail.context?.key,
        error: detail.message,
    }));
    return err;
}

export function validate(schema: Schema): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body ?? {}, { abortEarly: false });
        if (error) return next(buildValidationError(error));
        next();
    };
}

export function validateParams(schema: Schema): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.params ?? {}, { abortEarly: false });
        if (error) return next(buildValidationError(error));
        next();
    };
}

export function validateQuery(schema: Schema): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.validate(req.query ?? {}, { abortEarly: false }) as {
            error?: ValidationError;
            value: unknown;
        };
        const error = result.error;
        if (error) return next(buildValidationError(error));
        req.validatedQuery = result.value as Record<string, unknown>;
        next();
    };
}
