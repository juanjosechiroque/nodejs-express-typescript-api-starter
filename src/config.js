if (process.env.NODE_ENV === "development") {
    const dotenv = await import("dotenv");
    dotenv.config();
}

export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME;

const windowMinutes = process.env.RATE_LIMIT_WINDOW_MINUTES;
const maxRequests = process.env.RATE_LIMIT_MAX;

export const rateLimitWindowMs =
    windowMinutes != null ? Number(windowMinutes) * 60 * 1000 : 60 * 1000;

export const rateLimitMax = maxRequests != null ? Number(maxRequests) : 60;
