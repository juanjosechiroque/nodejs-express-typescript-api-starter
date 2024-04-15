if (process.env.NODE_ENV === "development") {
    const dotenv = await import("dotenv");
    dotenv.config();
}

export const PORT = process.env.PORT;
