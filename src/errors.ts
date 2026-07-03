export type AppError = Error & {
    code: string;
    statusCode: number;
    details?: Array<Record<string, unknown>>;
};

function createAppError(message: string, code: string, statusCode: number): AppError {
    const err = new Error(message) as AppError;
    err.code = code;
    err.statusCode = statusCode;
    return err;
}

export const BadRequestError = (errorMessage: string) =>
    createAppError(errorMessage, "BadRequestError", 400);

export const UnauthorizedError = (errorMessage: string, errorCode = "UnauthorizedError") =>
    createAppError(errorMessage, errorCode, 401);

export const NotFoundError = (errorMessage: string) =>
    createAppError(errorMessage, "NotFoundError", 404);
