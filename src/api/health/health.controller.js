export async function healthCheckHandler(req, res) {
    res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date(),
    });
}
