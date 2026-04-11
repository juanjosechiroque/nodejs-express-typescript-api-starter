import jwt from "jsonwebtoken";
const { sign, verify, TokenExpiredError, JsonWebTokenError } = jwt;

import { JWT_SECRET, JWT_EXPIRATION_TIME } from "../config.js";
import { UnauthorizedError } from "../errors.js";

export const generateToken = (payload) => {
    return sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION_TIME,
    });
};

export const verifyToken = (token) => {
    try {
        return verify(token, JWT_SECRET);
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            throw UnauthorizedError("Token expired", "TOKEN_EXPIRED");
        }
        if (err instanceof JsonWebTokenError) {
            throw UnauthorizedError("Invalid or expired token", "INVALID_TOKEN");
        }
        throw UnauthorizedError("Invalid or expired token", "INVALID_TOKEN");
    }
};
