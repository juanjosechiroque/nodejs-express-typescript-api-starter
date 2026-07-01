import app from "./src/app.js";
import { PORT } from "./src/config.js";
import { connectDB, disconnectDB } from "./src/database.js";
import logger from "./src/utils/logger.js";

await connectDB();

const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server started");
});

server.on("error", (err) => {
    logger.error({ err }, "Server failed to start");
    process.exit(1);
});

async function shutdown(signal) {
    logger.info({ signal }, "Shutdown initiated");
    await new Promise((resolve, reject) => {
        server.close((closeErr) => (closeErr ? reject(closeErr) : resolve()));
    });
    await disconnectDB();
    process.exit(0);
}

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
