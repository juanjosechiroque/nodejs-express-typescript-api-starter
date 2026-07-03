import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        include: ["src/**/*.test.ts"],
        setupFiles: ["src/tests/vitest.setup.ts"],
        clearMocks: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            exclude: [
                "coverage/**",
                "dist/**",
                "src/**/*.test.ts",
                "src/tests/**",
                "vitest.config.ts",
            ],
            thresholds: {
                statements: 60,
                branches: 60,
                functions: 60,
                lines: 60,
            },
        },
    },
});
