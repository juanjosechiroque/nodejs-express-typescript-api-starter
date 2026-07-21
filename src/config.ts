import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config({ quiet: true });
}

const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        PORT: z.coerce.number().int().positive().default(3000),
        MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required"),
        JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
        JWT_EXPIRATION_TIME: z.string().trim().min(1).default("1h"),
        CORS_ALLOWED_ORIGINS: z.string().trim().optional(),
        RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().optional(),
        RATE_LIMIT_MAX: z.coerce.number().int().positive().optional(),
        LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
    })
    .refine(
        (env) =>
            (env.RATE_LIMIT_WINDOW_MINUTES == null && env.RATE_LIMIT_MAX == null) ||
            (env.RATE_LIMIT_WINDOW_MINUTES != null && env.RATE_LIMIT_MAX != null),
        {
            message: "RATE_LIMIT_WINDOW_MINUTES and RATE_LIMIT_MAX must be configured together",
            path: ["RATE_LIMIT_WINDOW_MINUTES"],
        }
    );

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment configuration");
    console.error(z.prettifyError(parsedEnv.error));
    process.exit(1);
}

export const {
    NODE_ENV,
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRATION_TIME,
    CORS_ALLOWED_ORIGINS,
    RATE_LIMIT_WINDOW_MINUTES,
    RATE_LIMIT_MAX,
    LOG_LEVEL,
} = parsedEnv.data;
