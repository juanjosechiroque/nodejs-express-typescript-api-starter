import { jest } from "@jest/globals";
import mockMongoose from "./jest-mongoose-mock.js";

jest.mock("mongoose", () => ({
    __esModule: true,
    ...mockMongoose,
}));

jest.unstable_mockModule("../utils/jwt.js", () => ({
    generateToken: jest.fn(() => "valid-token"),
    verifyToken: jest.fn((token) => {
        if (token === "valid-token") {
            return { id: 1, name: "Mock User" };
        }
        throw new Error("Token inválido o expirado");
    }),
}));
