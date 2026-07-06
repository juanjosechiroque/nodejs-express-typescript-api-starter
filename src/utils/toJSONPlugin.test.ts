import { describe, expect, it } from "vitest";
import type { Schema } from "mongoose";
import { toJSONPlugin } from "./toJSONPlugin.js";

type ToJsonConfig = {
    versionKey: boolean;
    transform: (doc: unknown, ret: Record<string, unknown>) => void;
};

describe("toJSONPlugin", () => {
    function applyPlugin() {
        let capturedConfig: ToJsonConfig | undefined;
        const mockSchema = {
            set: (_key: string, config: ToJsonConfig) => {
                capturedConfig = config;
            },
        };
        toJSONPlugin(mockSchema as unknown as Schema);
        return capturedConfig as ToJsonConfig;
    }

    it("sets versionKey to false", () => {
        const config = applyPlugin();
        expect(config.versionKey).toBe(false);
    });

    it("maps _id to id", () => {
        const { transform } = applyPlugin();
        const ret: Record<string, unknown> = { _id: { toHexString: () => "abc123" }, name: "test" };
        transform({}, ret);
        expect(ret["id"]).toBe("abc123");
    });

    it("removes _id from output", () => {
        const { transform } = applyPlugin();
        const ret: Record<string, unknown> = { _id: { toHexString: () => "abc123" } };
        transform({}, ret);
        expect(ret["_id"]).toBeUndefined();
    });

    it("preserves other fields", () => {
        const { transform } = applyPlugin();
        const ret: Record<string, unknown> = {
            _id: { toHexString: () => "abc123" },
            name: "test",
            price: 42,
        };
        transform({}, ret);
        expect(ret["name"]).toBe("test");
        expect(ret["price"]).toBe(42);
    });
});
