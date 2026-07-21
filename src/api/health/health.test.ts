import { describe, expect, it } from "vitest";
import mockMongoose from "../../tests/mongoose-mock.js";

const { api, V1 } = await import("../../tests/helpers.js");

describe("GET /", () => {
    it("returns 200 with running status", async () => {
        const response = await api.get("/");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "running" });
    });

    it("includes security headers", async () => {
        const response = await api.get("/");

        expect(response.headers["x-content-type-options"]).toBe("nosniff");
        expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
        expect(response.headers).toHaveProperty("content-security-policy");
    });

    it("rejects JSON request bodies larger than 10kb", async () => {
        const response = await api.post("/unknown-route").send({ payload: "x".repeat(11 * 1024) });

        expect(response.status).toBe(413);
    });
});

describe("GET /v1/health", () => {
    it("returns healthy status when the database is connected", async () => {
        mockMongoose.connection.readyState = 1;

        const response = await api.get(`${V1}/health`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status", "healthy");
        expect(response.body).toHaveProperty("uptime");
        expect(response.body).toHaveProperty("timestamp");
        expect(response.body.services).toEqual({ db: "connected" });
    });

    it("returns 503 degraded status when the database is disconnected", async () => {
        mockMongoose.connection.readyState = 0;

        const response = await api.get(`${V1}/health`);

        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty("status", "degraded");
        expect(response.body.services).toEqual({ db: "disconnected" });

        mockMongoose.connection.readyState = 1;
    });
});

describe("unknown routes", () => {
    it("returns 404 with standard error format", async () => {
        const response = await api.get("/unknown-route");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("status", 404);
        expect(response.body).toHaveProperty("code", "NotFoundError");
        expect(response.body).toHaveProperty("message", "Route not found");
    });
});
