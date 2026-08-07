import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        include: ["src/**/*.integration.test.ts"],
        globalSetup: ["src/tests/integration/globalSetup.ts"],
        clearMocks: true,
        fileParallelism: false,
        maxWorkers: 1,
        testTimeout: 30_000,
        hookTimeout: 120_000,
        teardownTimeout: 30_000,
    },
});
