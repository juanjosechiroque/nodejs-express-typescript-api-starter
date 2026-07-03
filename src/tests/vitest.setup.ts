import { vi } from "vitest";
import mockMongoose from "./mongoose-mock.js";
import { UnauthorizedError } from "../errors.js";

process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/vitest";
process.env.JWT_SECRET ??= "test-jwt-secret-thirty-two-chars-min";

vi.mock("mongoose", () => ({
    default: mockMongoose,
    ...mockMongoose,
}));

const mockUserId = "507f1f77bcf86cd799439011";

vi.mock("../utils/jwt.js", () => ({
    generateToken: vi.fn(() => "valid-token"),
    verifyToken: vi.fn((token) => {
        if (token === "valid-token") {
            return { sub: mockUserId, email: "test@example.com" };
        }
        throw UnauthorizedError("Invalid or expired token", "INVALID_TOKEN");
    }),
}));
