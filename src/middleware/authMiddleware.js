import { verifyToken } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors.js";
import logger from "../utils/logger.js";

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
        logger.warn({ err: error, ip: req.ip, code: error.code }, "Auth token rejected");
        return next(error);
    }
};
