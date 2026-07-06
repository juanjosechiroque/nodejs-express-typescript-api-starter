import jwt from "jsonwebtoken";
const { sign, verify, TokenExpiredError, JsonWebTokenError } = jwt;

import { JWT_SECRET, JWT_EXPIRATION_TIME } from "../config.js";
import { UnauthorizedError } from "../errors.js";

export type JwtPayload = {
    sub: string;
    email: string;
};

export const generateToken = (payload: JwtPayload): string => {
    return sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION_TIME as NonNullable<jwt.SignOptions["expiresIn"]>,
    });
};

export const verifyToken = (token: string): JwtPayload => {
    try {
        return verify(token, JWT_SECRET) as JwtPayload;
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
