import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        include: ["src/**/*.integration.test.ts"],
        fileParallelism: false,
        hookTimeout: 120_000,
        testTimeout: 30_000,
    },
});
