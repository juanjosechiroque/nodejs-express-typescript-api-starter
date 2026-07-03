import type { Request, Response } from "express";
import mongoose from "mongoose";

export function healthCheckHandler(_req: Request, res: Response) {
    const dbStatus = Number(mongoose.connection.readyState) === 1 ? "connected" : "disconnected";

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
