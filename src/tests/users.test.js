import { jest } from "@jest/globals";
import mockMongoose from "./jest-mongoose-mock.js";

jest.mock("mongoose", () => ({
    __esModule: true,
    ...mockMongoose,
}));

jest.unstable_mockModule("../utils/jwt.js", () => ({
    generateToken: jest.fn(() => {
        return "valid-token";
    }),
    verifyToken: jest.fn(),
}));

const { api } = await import("./helpers.js");

describe("POST /users/singup", () => {
    test("should return a new user", async () => {
        const data = { email: "test@example.com", password: "test123" };

        const userMocked = {
            _id: "1",
            email: "test@example.com",
            password: "hashedpassword123",
            __v: 0,
        };

        mockMongoose
            .model("User")
            .prototype.save.mockImplementationOnce(function () {
                Object.assign(this, userMocked);
                return Promise.resolve(this);
            });

        const response = await api.post("/users/signup").send(data);

        expect(response.status).toBe(201);
        expect(response.body.data).toBe("valid-token");
    });

    test("should return an error when email is already registered", async () => {
        const data = { email: "test@example.com", password: "test123" };

        const userMocked = { _id: "1", email: "test@example.com" };
        mockMongoose.model("User").findOne.mockResolvedValue(userMocked);

        const response = await api.post("/users/signup").send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "Email address is already registered"
        );
    });

    test("should return an error when input is invalid", async () => {
        const response = await api.post("/users/signup");
        expect(response.status).toBe(400);
    });
});
