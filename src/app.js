import express from "express";
import rateLimit from "express-rate-limit";
import router from "./router.js";
import cors from "cors";
import { errorGenericHandler } from "./middleware/errorMiddleware.js";
import { notFound } from "./middleware/notFoundMiddleware.js";
import helmet from "helmet";
import { rateLimitWindowMs, rateLimitMax } from "./config.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: "running" });
});

if (process.env.NODE_ENV !== "test") {
    app.use(
        rateLimit({
            windowMs: rateLimitWindowMs,
            limit: rateLimitMax,
            standardHeaders: true,
            legacyHeaders: false,
        })
    );
}

app.use("/v1", router);
app.use(notFound);
app.use(errorGenericHandler);

export default app;
