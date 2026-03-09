import { NotFoundError } from "../errors.js";

export function notFound(req, res, next) {
    next(NotFoundError("Route not found"));
}
