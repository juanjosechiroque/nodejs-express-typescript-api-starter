import express from "express";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import router from "./router.js";
import cors from "cors";
import { errorGenericHandler } from "./middleware/errorMiddleware.js";
import { notFound } from "./middleware/notFoundMiddleware.js";
import { requestIdMiddleware } from "./middleware/requestIdMiddleware.js";
import helmet from "helmet";
import {
    CORS_ALLOWED_ORIGINS,
    NODE_ENV,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MINUTES,
} from "./config.js";
import logger from "./utils/logger.js";
import type { Request } from "express";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(requestIdMiddleware);

if (NODE_ENV !== "test") {
    app.use(
        pinoHttp({
            logger,
            genReqId: (req: Request) => req.id,
            customSuccessMessage: () => "request completed",
            customErrorMessage: () => "request failed",
            serializers: {
                req: (req: Record<string, unknown>) => ({
                    id: req["id"],
                    method: req["method"],
                    url: req["url"],
                }),
                res: (res: Record<string, unknown>) => ({ statusCode: res["statusCode"] }),
            },
        })
    );
}

if (CORS_ALLOWED_ORIGINS) {
    const allowedOrigins = CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

    app.use(
        cors({
            origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
        })
    );
}

if (NODE_ENV !== "test" && RATE_LIMIT_WINDOW_MINUTES && RATE_LIMIT_MAX) {
    app.use(
        rateLimit({
            windowMs: RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
            limit: RATE_LIMIT_MAX,
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
