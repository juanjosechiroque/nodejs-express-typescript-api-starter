import app from "./src/app.js";
import { PORT } from "./src/config.js";
import { connectDB, disconnectDB } from "./src/database.js";
import logger from "./src/utils/logger.js";

await connectDB();

const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server started");
});

const SHUTDOWN_TIMEOUT_MS = 10_000;
let shutdownPromise: Promise<void> | undefined;

server.on("error", (err: Error) => {
    logger.error({ err }, "Server failed to start");
    process.exit(1);
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
    logger.info({ signal }, "Shutdown initiated");

    const forceShutdownTimer = setTimeout(() => {
        logger.error({ signal, timeoutMs: SHUTDOWN_TIMEOUT_MS }, "Graceful shutdown timed out");
        server.closeAllConnections();
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceShutdownTimer.unref();

    try {
        const httpServerClosed = new Promise<void>((resolve, reject) => {
            server.close((closeErr) => (closeErr ? reject(closeErr) : resolve()));
        });

        // close() stops new connections; this closes keep-alive connections that are currently idle.
        server.closeIdleConnections();
        await httpServerClosed;
        await disconnectDB();

        clearTimeout(forceShutdownTimer);
        logger.info({ signal }, "Graceful shutdown completed");
        process.exit(0);
    } catch (error) {
        clearTimeout(forceShutdownTimer);
        logger.error({ err: error, signal }, "Graceful shutdown failed");
        process.exit(1);
    }
}

function requestShutdown(signal: NodeJS.Signals) {
    if (shutdownPromise) {
        logger.warn({ signal }, "Shutdown already in progress");
        return;
    }

    shutdownPromise = shutdown(signal);
}

process.on("SIGTERM", () => {
    requestShutdown("SIGTERM");
});
process.on("SIGINT", () => {
    requestShutdown("SIGINT");
});
