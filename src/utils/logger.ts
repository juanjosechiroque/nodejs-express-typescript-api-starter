import pino from "pino";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    ...(process.env.NODE_ENV !== "production" && {
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
