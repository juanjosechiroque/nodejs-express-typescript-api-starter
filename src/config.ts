if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
}

const env = process.env;

const REQUIRED_ENV_VARS = ["MONGODB_URI", "JWT_SECRET"];

const missing = REQUIRED_ENV_VARS.filter((key) => !String(env[key] ?? "").trim());
if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
}

export const PORT = Number(env.PORT) || 3000;
export const MONGODB_URI = env.MONGODB_URI as string;
export const JWT_SECRET = env.JWT_SECRET as string;
export const JWT_EXPIRATION_TIME = env.JWT_EXPIRATION_TIME || "1h";
export const CORS_ALLOWED_ORIGINS = env.CORS_ALLOWED_ORIGINS;
export const RATE_LIMIT_WINDOW_MINUTES = env.RATE_LIMIT_WINDOW_MINUTES;
export const RATE_LIMIT_MAX = env.RATE_LIMIT_MAX;
