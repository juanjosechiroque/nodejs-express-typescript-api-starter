import { jest } from "@jest/globals";
import mockMongoose from "./jest-mongoose-mock.js";
import { UnauthorizedError } from "../errors.js";

process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/jest";
process.env.JWT_SECRET ??= "test-jwt-secret-thirty-two-chars-min";

jest.mock("mongoose", () => ({
    __esModule: true,
    ...mockMongoose,
}));

const mockUserId = "507f1f77bcf86cd799439011";

jest.unstable_mockModule("../utils/jwt.js", () => ({
    generateToken: jest.fn(() => "valid-token"),
    verifyToken: jest.fn((token) => {
        if (token === "valid-token") {
            return { sub: mockUserId, email: "test@example.com" };
        }
        throw UnauthorizedError("Invalid or expired token", "INVALID_TOKEN");
    }),
}));
