export function sendResponse(res, status, data = null, message = "success") {
    res.status(status).json({
        status,
        message,
        data,
    });
}
