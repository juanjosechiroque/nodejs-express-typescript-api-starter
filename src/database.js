import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";

export async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export async function disconnectDB() {
    await mongoose.connection.close();
}
