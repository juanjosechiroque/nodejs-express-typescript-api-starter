import app from "./src/app.js";
import { PORT } from "./src/config.js";
import { connectDB, disconnectDB } from "./src/database.js";

await connectDB();

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
    console.error("Server failed to start:", err.message);
    process.exit(1);
});

async function shutdown(signal) {
    console.log(`Received ${signal}, closing...`);
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
