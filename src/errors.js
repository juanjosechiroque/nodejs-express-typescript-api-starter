export const BadRequestError = (errorMessage) => {
    return {
        code: "BadRequestError",
        message: errorMessage,
        statusCode: 400,
    };
};
