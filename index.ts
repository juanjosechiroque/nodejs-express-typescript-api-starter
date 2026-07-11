import app from "./src/app.js";
import { PORT } from "./src/config.js";
import { connectDB, disconnectDB } from "./src/database.js";
import logger from "./src/utils/logger.js";

await connectDB();

const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server started");
});

server.on("error", (err: Error) => {
    logger.error({ err }, "Server failed to start");
    process.exit(1);
});

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
    logger.info({ signal }, "Shutdown initiated");

    if (shuttingDown) return;
    shuttingDown = true;

    let exitCode = 0;
    const forceShutdownTimer = setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10_000);

    forceShutdownTimer.unref();

    try {
        await new Promise<void>((resolve, reject) => {
            server.close((closeErr) => (closeErr ? reject(closeErr) : resolve()));
        });
    } catch (error) {
        exitCode = 1;
        logger.error({ err: error }, "HTTP server failed to close cleanly");
    } finally {
        await disconnectDB();
        clearTimeout(forceShutdownTimer);
    }

    logger.info({ exitCode }, "Shutdown completed");
    process.exit(exitCode);
}

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
