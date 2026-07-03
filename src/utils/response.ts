import type { Response } from "express";

export function sendResponse(
    res: Response,
    status: number,
    data: unknown = null,
    message = "success"
) {
    res.status(status).json({
        status,
        message,
        data,
    });
}
