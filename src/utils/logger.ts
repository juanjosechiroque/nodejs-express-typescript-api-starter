import pino from "pino";
import { LOG_LEVEL, NODE_ENV } from "../config.js";

export const logRedaction = {
    paths: [
        "authorization",
        "cookie",
        "password",
        "token",
        "*.password",
        "*.token",
        "body.password",
        "body.token",
        "headers.authorization",
        "headers.cookie",
        "req.body.password",
        "req.headers.authorization",
        "req.headers.cookie",
        "request.body.password",
        "request.headers.authorization",
        "request.headers.cookie",
    ],
    censor: "[REDACTED]",
};

const logger = pino({
    enabled: NODE_ENV !== "test",
    level: LOG_LEVEL,
    redact: logRedaction,
    ...(NODE_ENV === "development" && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                ignore: "pid,hostname",
                singleLine: true,
                translateTime: "yyyy-mm-dd HH:MM:ss",
            },
        },
    }),
});

export default logger;
