import { describe, expect, it } from "vitest";
import app from "./app.js";

describe("app configuration", () => {
    it("does not trust forwarded headers by default", () => {
        expect(app.get("trust proxy")).toBe(0);
    });
});
