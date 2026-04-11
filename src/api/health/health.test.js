const { api, V1 } = await import("../../tests/helpers.js");

test("GET / should return 200 and status running", async () => {
    const response = await api.get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "running" });
});

test("GET /v1/health should return healthy status", async () => {
    const response = await api.get(`${V1}/health`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("timestamp");
});

test("GET unknown route should return 404 with standard format", async () => {
    const response = await api.get("/unknown-route");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("status", 404);
    expect(response.body).toHaveProperty("code", "NotFoundError");
    expect(response.body).toHaveProperty("message", "Route not found");
});
