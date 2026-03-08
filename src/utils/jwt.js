import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

import { JWT_SECRET, JWT_EXPIRATION_TIME } from "../config.js";

export const generateToken = (payload) => {
    return sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION_TIME,
    });
};

export const verifyToken = (token) => {
    try {
        return verify(token, JWT_SECRET);
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
};
