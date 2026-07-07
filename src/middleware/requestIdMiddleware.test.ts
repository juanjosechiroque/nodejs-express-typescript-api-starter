import { describe, expect, it } from "vitest";

const { api } = await import("../tests/helpers.js");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("request ID tracing", () => {
    it("returns the client-provided x-request-id", async () => {
        const requestId = "client-trace-abc-123";

        const response = await api.get("/").set("x-request-id", requestId);

        expect(response.headers["x-request-id"]).toBe(requestId);
    });

    it("generates a UUID x-request-id when the client omits it", async () => {
        const response = await api.get("/");

        expect(response.headers["x-request-id"]).toBeDefined();
        expect(response.headers["x-request-id"]).toMatch(UUID_REGEX);
    });
});
