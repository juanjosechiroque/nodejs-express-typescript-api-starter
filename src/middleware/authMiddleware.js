import { verifyToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors.js";

export const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return next(UnauthorizedError("Authorization header missing or invalid"));
    }

    const token = authHeader.slice(7).trim();

    if (!token || token === "") {
        return next(UnauthorizedError("Access denied"));
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return next(UnauthorizedError("Invalid or expired token"));
    }
};
