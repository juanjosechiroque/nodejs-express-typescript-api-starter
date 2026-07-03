export default {
    testEnvironment: "node",
    collectCoverage: true,
    silent: false,
    verbose: true,
    extensionsToTreatAsEsm: [".ts"],
    transform: {
        "^.+\\.ts$": ["ts-jest", { useESM: true, diagnostics: false, tsconfig: "tsconfig.json" }],
    },
    setupFilesAfterEnv: ["<rootDir>/src/tests/jest.setup.ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 60,
            functions: 60,
            lines: 60,
        },
    },
};
