import express from "express";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./router.js";
import cors from "cors";
import { errorGenericHandler } from "./middleware/errorMiddleware.js";
import { notFound } from "./middleware/notFoundMiddleware.js";
import helmet from "helmet";
import { CORS_ALLOWED_ORIGINS, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MINUTES } from "./config.js";
import logger from "./utils/logger.js";

const app = express();

app.use(helmet());

if (process.env.NODE_ENV !== "test") {
    app.use(pinoHttp({ logger }));
}

if (CORS_ALLOWED_ORIGINS) {
    const allowedOrigins = CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

    app.use(
        cors({
            origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
        })
    );
}

if (process.env.NODE_ENV !== "test" && RATE_LIMIT_WINDOW_MINUTES && RATE_LIMIT_MAX) {
    app.use(
        rateLimit({
            windowMs: Number(RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000,
            limit: Number(RATE_LIMIT_MAX),
            standardHeaders: true,
            legacyHeaders: false,
        })
    );
}

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
    res.json({ status: "running" });
});

app.use("/v1", router);
app.use(notFound);
app.use(errorGenericHandler);

export default app;
