export const errorGenericHandler = (err, req, res, next) => {
    let errorCode = err.code;
    let errorStatus = err.statusCode || 500;
    let errorMessage = err.message || "Internal server error";

    res.status(errorStatus).json({
        status: errorStatus,
        code: errorCode,
        message: errorMessage,
    });
};
