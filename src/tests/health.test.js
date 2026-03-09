const { api } = await import("./helpers.js");

test("GET /health should return healthy status", async () => {
    const response = await api.get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("uptime");
});

test("GET unknown route should return 404 with standard format", async () => {
    const response = await api.get("/unknown-route");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("status", 404);
    expect(response.body).toHaveProperty("code", "NotFoundError");
    expect(response.body).toHaveProperty("message", "Route not found");
});
