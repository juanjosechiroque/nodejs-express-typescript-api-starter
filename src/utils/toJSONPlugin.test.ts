import { toJSONPlugin } from "./toJSONPlugin.js";

describe("toJSONPlugin", () => {
    function applyPlugin() {
        let capturedConfig;
        const mockSchema = {
            set: (key, config) => {
                capturedConfig = config;
            },
        };
        toJSONPlugin(mockSchema);
        return capturedConfig;
    }

    test("sets versionKey to false", () => {
        const config = applyPlugin();
        expect(config.versionKey).toBe(false);
    });

    test("maps _id to id", () => {
        const { transform } = applyPlugin();
        const ret = { _id: { toHexString: () => "abc123" }, name: "test" };
        transform({}, ret);
        expect(ret.id).toBe("abc123");
    });

    test("removes _id from output", () => {
        const { transform } = applyPlugin();
        const ret = { _id: { toHexString: () => "abc123" } };
        transform({}, ret);
        expect(ret._id).toBeUndefined();
    });

    test("preserves other fields", () => {
        const { transform } = applyPlugin();
        const ret = { _id: { toHexString: () => "abc123" }, name: "test", price: 42 };
        transform({}, ret);
        expect(ret.name).toBe("test");
        expect(ret.price).toBe(42);
    });
});
