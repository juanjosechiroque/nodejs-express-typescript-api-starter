function resolveError(err) {
    if (err == null || typeof err !== "object") {
        return {
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
            stack: undefined,
            details: undefined,
        };
    }

    if (err.statusCode) {
        return {
            statusCode: err.statusCode,
            code: err.code ?? "Error",
            message: err.message,
            stack: err.stack,
            details: err.details,
        };
    }

    // Use err.name so tests work when mongoose is mocked (no mongoose.Error.* constructors).
    if (err.name === "CastError") {
        return {
            statusCode: 400,
            code: "BadRequestError",
            message: "Invalid identifier format",
            stack: err.stack,
            details: undefined,
        };
    }

    if (err.name === "ValidationError") {
        return {
            statusCode: 400,
            code: "BadRequestError",
            message: "Validation failed",
            stack: err.stack,
            details: undefined,
        };
    }

    const isProduction = process.env.NODE_ENV === "production";
    return {
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: isProduction ? "Internal server error" : (err.message ?? "Internal server error"),
        stack: err.stack,
        details: undefined,
    };
}

export const errorGenericHandler = (err, req, res, next) => {
    const resolved = resolveError(err);

    if (resolved.statusCode >= 500 && process.env.NODE_ENV === "production") {
        resolved.message = "Internal server error";
        resolved.code = "INTERNAL_SERVER_ERROR";
    }

    const result = {
        status: resolved.statusCode,
        code: resolved.code,
        message: resolved.message,
    };

    if (resolved.details != null && Array.isArray(resolved.details)) {
        result.details = resolved.details;
    }

    if (process.env.NODE_ENV !== "production") {
        result.stack = resolved.stack;
    }

    res.status(resolved.statusCode).json(result);
};
