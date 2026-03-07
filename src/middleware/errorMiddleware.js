export const errorGenericHandler = (err, req, res, next) => {
    const {
        code = "INTERNAL_SERVER_ERROR",
        statusCode = 500,
        message = "Internal server error",
        stack,
        details,
    } = err;

    const result = {
        status: statusCode,
        code,
        message,
    };

    if (details != null && Array.isArray(details)) {
        result.details = details;
    }

    if (process.env.NODE_ENV !== "production") {
        result.stack = stack;
    }

    res.status(statusCode).json(result);
};
