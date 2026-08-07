import express from "express";
import supertest from "supertest";
import { describe, expect, it } from "vitest";
import { configureTrustProxy } from "./trustProxy.js";

function createIpProbeApp(trustedHops: number) {
    const app = express();
    configureTrustProxy(app, trustedHops);
    app.get("/ip", (req, res) => {
        res.json({ ip: req.ip, ips: req.ips, protocol: req.protocol });
    });
    return supertest(app);
}

describe("Feature: trusted proxy configuration", () => {
    it("ignores forwarded client and protocol headers when no proxy is trusted", async () => {
        const response = await createIpProbeApp(0)
            .get("/ip")
            .set("x-forwarded-for", "203.0.113.10")
            .set("x-forwarded-proto", "https");

        expect(response.body.ip).not.toBe("203.0.113.10");
        expect(response.body.ips).toEqual([]);
        expect(response.body.protocol).toBe("http");
    });

    it("uses forwarded client and protocol headers behind one trusted proxy", async () => {
        const response = await createIpProbeApp(1)
            .get("/ip")
            .set("x-forwarded-for", "203.0.113.10")
            .set("x-forwarded-proto", "https");

        expect(response.body).toMatchObject({
            ip: "203.0.113.10",
            ips: ["203.0.113.10"],
            protocol: "https",
        });
    });

    it("selects the client address across the configured number of trusted hops", async () => {
        const response = await createIpProbeApp(2)
            .get("/ip")
            .set("x-forwarded-for", "203.0.113.10, 10.0.0.5");

        expect(response.body.ip).toBe("203.0.113.10");
        expect(response.body.ips).toEqual(["203.0.113.10", "10.0.0.5"]);
    });
});
