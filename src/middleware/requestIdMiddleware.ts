import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

const REQUEST_ID_HEADER = "x-request-id";

function resolveRequestId(header: string | string[] | undefined): string {
    if (typeof header === "string" && header.trim()) {
        return header.trim();
    }

    if (Array.isArray(header) && header[0]?.trim()) {
        return header[0].trim();
    }

    return randomUUID();
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = resolveRequestId(req.headers[REQUEST_ID_HEADER]);

    req.id = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
}
