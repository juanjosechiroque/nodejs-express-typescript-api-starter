import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

const REQUEST_ID_HEADER = "x-request-id";
const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

function resolveRequestId(header: string | string[] | undefined): string {
    const candidate = Array.isArray(header) ? header[0]?.trim() : header?.trim();

    if (candidate && SAFE_REQUEST_ID_PATTERN.test(candidate)) return candidate;

    return randomUUID();
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = resolveRequestId(req.headers[REQUEST_ID_HEADER]);

    req.id = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
}
