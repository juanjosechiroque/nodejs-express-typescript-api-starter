export default {
    testEnvironment: "node",
    collectCoverage: true,
    silent: false,
    verbose: true,
    transform: {},
    setupFilesAfterEnv: ["<rootDir>/src/tests/jest.setup.js"],
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 60,
            functions: 60,
            lines: 60,
        },
    },
};
