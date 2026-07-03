import type { ErrorRequestHandler } from "express";
import type { AppError } from "../errors.js";
import { NODE_ENV } from "../config.js";

type ResolvedError = {
    statusCode: number;
    code: string;
    message: string;
    stack?: string | undefined;
    details?: AppError["details"] | undefined;
};

type ErrorLike = Partial<AppError> & {
    status?: number;
    name?: string;
};

function resolveError(err: unknown): ResolvedError {
    if (err == null || typeof err !== "object") {
        return {
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
            stack: undefined,
            details: undefined,
        };
    }

    const errorLike = err as ErrorLike;

    if (errorLike.statusCode) {
        return {
            statusCode: errorLike.statusCode,
            code: errorLike.code ?? "Error",
            message: errorLike.message ?? "Unexpected error",
            stack: errorLike.stack,
            details: errorLike.details,
        };
    }

    // Use err.name so tests work when mongoose is mocked (no mongoose.Error.* constructors).
    if (errorLike.name === "CastError") {
        return {
            statusCode: 400,
            code: "BadRequestError",
            message: "Invalid identifier format",
            stack: errorLike.stack,
            details: undefined,
        };
    }

    if (errorLike.name === "ValidationError") {
        return {
            statusCode: 400,
            code: "BadRequestError",
            message: "Validation failed",
            stack: errorLike.stack,
            details: undefined,
        };
    }

    const isProduction = NODE_ENV === "production";
    return {
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: isProduction
            ? "Internal server error"
            : (errorLike.message ?? "Internal server error"),
        stack: errorLike.stack,
        details: undefined,
    };
}

export const errorGenericHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const resolved = resolveError(err);

    if (resolved.statusCode >= 500 && NODE_ENV === "production") {
        resolved.message = "Internal server error";
        resolved.code = "INTERNAL_SERVER_ERROR";
    }

    const result: {
        status: number;
        code: string;
        message: string;
        details?: AppError["details"] | undefined;
        stack?: string | undefined;
    } = {
        status: resolved.statusCode,
        code: resolved.code,
        message: resolved.message,
    };

    if (resolved.details != null && Array.isArray(resolved.details)) {
        result.details = resolved.details;
    }

    if (NODE_ENV !== "production") {
        result.stack = resolved.stack;
    }

    res.status(resolved.statusCode).json(result);
};
