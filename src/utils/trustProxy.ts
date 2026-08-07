import type { Express } from "express";

/**
 * Trust exactly the configured number of network hops in front of Express.
 * Zero keeps forwarded client/protocol headers untrusted, which is the safe default.
 */
export function configureTrustProxy(app: Express, hops: number) {
    app.set("trust proxy", hops);
}
