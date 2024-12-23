if (process.env.NODE_ENV === "development") {
    const dotenv = await import("dotenv");
    dotenv.config();
}

export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME;
