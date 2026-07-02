import mongoose from "mongoose";

export async function healthCheckHandler(req, res) {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    if (dbStatus === "disconnected") {
        return res.status(503).json({
            status: "degraded",
            uptime: process.uptime(),
            timestamp: new Date(),
            services: { db: dbStatus },
        });
    }

    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date(),
        services: { db: dbStatus },
    });
}
