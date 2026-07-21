import { Writable } from "node:stream";
import pino from "pino";
import { describe, expect, it } from "vitest";
import { logRedaction } from "./logger.js";

describe("logger redaction", () => {
    it("redacts credentials from common log shapes", () => {
        let output = "";
        const destination = new Writable({
            write(chunk, _encoding, callback) {
                output += chunk.toString();
                callback();
            },
        });
        const testLogger = pino({ redact: logRedaction }, destination);

        testLogger.info({
            password: "plain-password",
            token: "access-token",
            req: {
                headers: { authorization: "Bearer secret", cookie: "session=secret" },
                body: { password: "nested-password" },
            },
        });

        expect(output).not.toContain("plain-password");
        expect(output).not.toContain("access-token");
        expect(output).not.toContain("Bearer secret");
        expect(output).not.toContain("session=secret");
        expect(output).not.toContain("nested-password");
        expect(output).toContain("[REDACTED]");
    });
});
