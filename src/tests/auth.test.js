import bcrypt from "bcrypt";
import mockMongoose from "./jest-mongoose-mock.js";

const { api } = await import("./helpers.js");

describe("POST /auth/signup", () => {
    test("should return a new user", async () => {
        const data = { email: "test@example.com", password: "test1234" };

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

        const response = await api.post("/auth/signup").send(data);

        expect(response.status).toBe(201);
        expect(response.body.data).toBe("valid-token");
    });

    test("should return an error when email is already registered", async () => {
        const data = { email: "test@example.com", password: "test1234" };

        const userMocked = { _id: "1", email: "test@example.com" };
        mockMongoose.model("User").findOne.mockResolvedValueOnce(userMocked);

        const response = await api.post("/auth/signup").send(data);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "Email address is already registered"
        );
    });

    test("should return an error when input is invalid", async () => {
        const response = await api.post("/auth/signup");
        expect(response.status).toBe(400);
    });

    test("should return 400 when password has less than 8 characters", async () => {
        const response = await api
            .post("/auth/signup")
            .send({ email: "test@example.com", password: "1234567" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch(
            /8 characters|length|Validation/i
        );
    });
});

describe("POST /auth/login", () => {
    test("should return token when credentials are valid", async () => {
        const password = "test1234";
        const hash = await bcrypt.hash(password, 10);
        mockMongoose.model("User").findOne.mockResolvedValueOnce({
            _id: "1",
            email: "test@example.com",
            password: hash,
        });

        const response = await api
            .post("/auth/login")
            .send({ email: "test@example.com", password });

        expect(response.status).toBe(200);
        expect(response.body.data).toBe("valid-token");
    });

    test("should return 401 when user does not exist", async () => {
        mockMongoose.model("User").findOne.mockResolvedValueOnce(null);

        const response = await api
            .post("/auth/login")
            .send({ email: "unknown@example.com", password: "test1234" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });

    test("should return 401 when password is wrong", async () => {
        const hash = await bcrypt.hash("correctpassword", 10);
        mockMongoose.model("User").findOne.mockResolvedValueOnce({
            _id: "1",
            email: "test@example.com",
            password: hash,
        });

        const response = await api
            .post("/auth/login")
            .send({ email: "test@example.com", password: "wrongpassword" });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });

    test("should return 400 when input is invalid", async () => {
        const response = await api.post("/auth/login");
        expect(response.status).toBe(400);
    });
});
