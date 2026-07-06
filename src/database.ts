import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";
import { toJSONPlugin } from "./utils/toJSONPlugin.js";
import logger from "./utils/logger.js";

mongoose.plugin(toJSONPlugin);

export async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info("MongoDB connected");
    } catch (error) {
        logger.error({ err: error }, "MongoDB connection failed");
        process.exit(1);
    }
}

export async function disconnectDB() {
    try {
        await mongoose.connection.close();
        logger.info("MongoDB disconnected");
    } catch (error) {
        logger.error({ err: error }, "MongoDB disconnect failed");
    }
}
