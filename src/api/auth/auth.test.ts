import bcrypt from "bcrypt";
import { describe, expect, test, vi } from "vitest";
import mockMongoose from "../../tests/mongoose-mock.js";

const { api, V1 } = await import("../../tests/helpers.js");

function mockFindOne(value: unknown) {
    mockMongoose.model("User").findOne.mockReturnValueOnce({
        lean: vi.fn().mockResolvedValue(value),
    });
}

describe(`POST ${V1}/auth/signup`, () => {
    test("should return a new user", async () => {
        const data = { email: "test@example.com", password: "test1234" };

        const userMocked = {
            _id: "1",
            email: "test@example.com",
            password: "hashedpassword123",
            __v: 0,
        };

        mockMongoose.model("User").prototype.save.mockImplementationOnce(function (
            this: Record<string, unknown>
        ) {
            Object.assign(this, userMocked);
            return Promise.resolve(this);
        });

        const response = await api.post(`${V1}/auth/signup`).send(data);

        expect(response.status).toBe(201);
        expect(response.body.data).toBe("valid-token");
    });

    test("should return an error when email is already registered", async () => {
        const data = { email: "test@example.com", password: "test1234" };
        mockFindOne({ _id: "1", email: "test@example.com" });

        const response = await api.post(`${V1}/auth/signup`).send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email address is already registered");
    });

    test("should return 400 on duplicate key race condition (err.code 11000)", async () => {
        const data = { email: "test@example.com", password: "test1234" };
        mockFindOne(null);
        const duplicateKeyError = Object.assign(new Error("Duplicate key"), { code: 11000 });
        mockMongoose.model("User").prototype.save.mockRejectedValueOnce(duplicateKeyError);

        const response = await api.post(`${V1}/auth/signup`).send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Email address is already registered");
    });

    test("should return an error when input is invalid", async () => {
        const response = await api.post(`${V1}/auth/signup`);
        expect(response.status).toBe(400);
    });

    test("should return 400 when password has less than 8 characters", async () => {
        const response = await api
            .post(`${V1}/auth/signup`)
            .send({ email: "test@example.com", password: "1234567" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch(/8 characters|length|Validation/i);
    });
});

describe(`POST ${V1}/auth/login`, () => {
    test("should return token when credentials are valid", async () => {
        const password = "test1234";
        const hash = await bcrypt.hash(password, 10);
        mockFindOne({ _id: "1", email: "test@example.com", password: hash });

        const response = await api
            .post(`${V1}/auth/login`)
            .send({ email: "test@example.com", password });

        expect(response.status).toBe(200);
        expect(response.body.data).toBe("valid-token");
    });

    test("should return 401 when user does not exist", async () => {
        mockFindOne(null);

        const response = await api
            .post(`${V1}/auth/login`)
            .send({ email: "unknown@example.com", password: "test1234" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });

    test("should return 401 when password is wrong", async () => {
        const hash = await bcrypt.hash("correctpassword", 10);
        mockFindOne({ _id: "1", email: "test@example.com", password: hash });

        const response = await api
            .post(`${V1}/auth/login`)
            .send({ email: "test@example.com", password: "wrongpassword" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });

    test("should return 400 when input is invalid", async () => {
        const response = await api.post(`${V1}/auth/login`);
        expect(response.status).toBe(400);
    });
});
