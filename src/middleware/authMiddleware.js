import { verifyToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors.js";

const bearerTokenRegex = /^Bearer\s+(\S+)$/i;

export const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const match = authHeader?.match(bearerTokenRegex);

    if (!match) {
        return next(UnauthorizedError("Authorization header missing or invalid"));
    }

    const token = match[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return next(error);
    }
};
