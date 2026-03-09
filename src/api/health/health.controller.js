import mongoose from "mongoose";

export async function healthCheck(req, res) {
    const db =
        mongoose.connection?.readyState === 1 ? "connected" : "disconnected";

    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date(),
        db,
    });
}
