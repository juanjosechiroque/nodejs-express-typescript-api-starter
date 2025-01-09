const { api } = await import("./helpers.js");

test("GET /health should return healthy status", async () => {
    const response = await api.get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("uptime");
});
