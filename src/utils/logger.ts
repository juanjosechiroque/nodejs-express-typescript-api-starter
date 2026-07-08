import pino from "pino";
import { LOG_LEVEL, NODE_ENV } from "../config.js";

const logger = pino({
    enabled: NODE_ENV !== "test",
    level: LOG_LEVEL,
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
