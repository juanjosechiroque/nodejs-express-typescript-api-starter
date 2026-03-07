export default {
    testEnvironment: "node",
    collectCoverage: true,
    silent: false,
    verbose: true,
    transform: {},
    setupFilesAfterEnv: ["<rootDir>/src/tests/jest.setup.js"],
    coverageThreshold: {
        global: {
            statements: 65,
            branches: 65,
            functions: 65,
            lines: 65,
        },
    },
};
