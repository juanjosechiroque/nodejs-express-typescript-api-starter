export const BadRequestError = (errorMessage) => {
    return {
        code: "BadRequestError",
        message: errorMessage,
        statusCode: 400,
    };
};

export const UnauthorizedError = (errorMessage) => {
    return {
        code: "UnauthorizedError",
        message: errorMessage,
        statusCode: 401,
    };
};

export const NotFoundError = (errorMessage) => {
    return {
        code: "NotFoundError",
        message: errorMessage,
        statusCode: 404,
    };
};
