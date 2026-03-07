export default {
    testEnvironment: "node",
    collectCoverage: true,
    silent: false,
    verbose: true,
    transform: {},
    setupFilesAfterEnv: ["<rootDir>/src/tests/jest.setup.js"],
    coverageThreshold: {
        global: {
            statements: 50,
            branches: 50,
            functions: 50,
            lines: 50,
        },
    },
};
