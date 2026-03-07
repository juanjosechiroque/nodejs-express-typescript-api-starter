export default {
    testEnvironment: "node",
    collectCoverage: true,
    silent: false,
    verbose: true,
    transform: {},
    setupFilesAfterEnv: ["<rootDir>/src/tests/jest.setup.js"],
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
        },
    },
};
