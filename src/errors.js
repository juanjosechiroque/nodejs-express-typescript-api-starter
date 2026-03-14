function createAppError(message, code, statusCode) {
    const err = new Error(message);
    err.code = code;
    err.statusCode = statusCode;
    return err;
}

export const BadRequestError = (errorMessage) =>
    createAppError(errorMessage, "BadRequestError", 400);

export const UnauthorizedError = (errorMessage) =>
    createAppError(errorMessage, "UnauthorizedError", 401);

export const NotFoundError = (errorMessage) => createAppError(errorMessage, "NotFoundError", 404);
