import { afterEach, describe, expect, test, vi } from "vitest";
import { errorGenericHandler } from "./errorMiddleware.js";

function makeRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

const req = {};
const next = vi.fn();

describe("errorGenericHandler", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
        vi.resetModules();
    });

    test("returns 500 when error is null", () => {
        const res = makeRes();
        errorGenericHandler(null, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ code: "INTERNAL_SERVER_ERROR" })
        );
    });

    test("returns 500 when error is a string", () => {
        const res = makeRes();
        errorGenericHandler("something broke", req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test("returns typed status and code for app errors", () => {
        const res = makeRes();
        const err = { statusCode: 404, code: "NotFoundError", message: "Not found" };
        errorGenericHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ code: "NotFoundError", message: "Not found" })
        );
    });

    test("falls back to 'Error' code when app error has no code", () => {
        const res = makeRes();
        const err = { statusCode: 400, message: "Bad input" };
        errorGenericHandler(err, req, res, next);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "Error" }));
    });

    test("returns 400 for CastError", () => {
        const res = makeRes();
        const err = new Error("Cast failed");
        err.name = "CastError";
        errorGenericHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                code: "BadRequestError",
                message: "Invalid identifier format",
            })
        );
    });

    test("returns 400 for ValidationError", () => {
        const res = makeRes();
        const err = new Error("Validation failed");
        err.name = "ValidationError";
        errorGenericHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ code: "BadRequestError", message: "Validation failed" })
        );
    });

    test("includes details array when present", () => {
        const res = makeRes();
        const err = {
            statusCode: 400,
            code: "BadRequestError",
            message: "Validation failed",
            details: [{ field: "email" }],
        };
        errorGenericHandler(err, req, res, next);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ details: [{ field: "email" }] })
        );
    });

    test("excludes details when not an array", () => {
        const res = makeRes();
        const err = {
            statusCode: 400,
            code: "BadRequestError",
            message: "Bad",
            details: "not an array",
        };
        errorGenericHandler(err, req, res, next);
        const body = res.json.mock.calls[0][0];
        expect(body).not.toHaveProperty("details");
    });

    test("includes stack in non-production", async () => {
        process.env.NODE_ENV = "development";
        const { errorGenericHandler } = await import("./errorMiddleware.js");
        const res = makeRes();
        const err = new Error("Unexpected");
        errorGenericHandler(err, req, res, next);
        const body = res.json.mock.calls[0][0];
        expect(body).toHaveProperty("stack");
    });

    test("hides message and stack in production for 5xx errors", async () => {
        process.env.NODE_ENV = "production";
        const { errorGenericHandler } = await import("./errorMiddleware.js");
        const res = makeRes();
        const err = new Error("Secret internal detail");
        errorGenericHandler(err, req, res, next);
        const body = res.json.mock.calls[0][0];
        expect(body.message).toBe("Internal server error");
        expect(body).not.toHaveProperty("stack");
    });
});
