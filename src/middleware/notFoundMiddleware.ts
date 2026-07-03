import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
    next(NotFoundError("Route not found"));
}
