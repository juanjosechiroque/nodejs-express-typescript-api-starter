import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { Request, Response } from "express";
import { errorGenericHandler } from "./errorMiddleware.js";

type MockRes = Response & { status: Mock; json: Mock };

function makeRes(): { res: MockRes; statusMock: Mock; jsonMock: Mock } {
    const status: Mock = vi.fn();
    const json: Mock = vi.fn();
    const res = { status, json };
    status.mockReturnValue(res);
    json.mockReturnValue(res);
    return { res: res as unknown as MockRes, statusMock: status, jsonMock: json };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getJsonBody(jsonMock: Mock): Record<string, unknown> {
    const body: unknown = jsonMock.mock.calls.at(0)?.at(0);
    if (!isRecord(body)) throw new Error("Expected the response body to be an object");
    return body;
}

const req = {} as unknown as Request;
const next = vi.fn();

describe("errorGenericHandler", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
        vi.resetModules();
    });

    it("returns 500 INTERNAL_SERVER_ERROR when the error is null", () => {
        const { res, statusMock, jsonMock } = makeRes();
        errorGenericHandler(null, req, res, next);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({ code: "INTERNAL_SERVER_ERROR" })
        );
    });

    it("returns 500 when the error is a plain string", () => {
        const { res, statusMock } = makeRes();
        errorGenericHandler("something broke", req, res, next);
        expect(statusMock).toHaveBeenCalledWith(500);
    });

    it("reflects the status code and code from a typed app error", () => {
        const { res, statusMock, jsonMock } = makeRes();
        const err = { statusCode: 404, code: "NotFoundError", message: "Not found" };
        errorGenericHandler(err, req, res, next);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({ code: "NotFoundError", message: "Not found" })
        );
    });

    it("falls back to 'Error' code when the app error has no code field", () => {
        const { res, jsonMock } = makeRes();
        const err = { statusCode: 400, message: "Bad input" };
        errorGenericHandler(err, req, res, next);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ code: "Error" }));
    });

    it("maps a Mongoose CastError to 400 with a safe message", () => {
        const { res, statusMock, jsonMock } = makeRes();
        const err = new Error("Cast failed");
        err.name = "CastError";
        errorGenericHandler(err, req, res, next);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                code: "BadRequestError",
                message: "Invalid identifier format",
            })
        );
    });

    it("maps a Mongoose ValidationError to 400", () => {
        const { res, statusMock, jsonMock } = makeRes();
        const err = new Error("Validation failed");
        err.name = "ValidationError";
        errorGenericHandler(err, req, res, next);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({ code: "BadRequestError", message: "Validation failed" })
        );
    });

    it("includes the details array when present on the error", () => {
        const { res, jsonMock } = makeRes();
        const err = {
            statusCode: 400,
            code: "BadRequestError",
            message: "Validation failed",
            details: [{ field: "email" }],
        };
        errorGenericHandler(err, req, res, next);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({ details: [{ field: "email" }] })
        );
    });

    it("omits details when the value is not an array", () => {
        const { res, jsonMock } = makeRes();
        const err = {
            statusCode: 400,
            code: "BadRequestError",
            message: "Bad",
            details: "not an array",
        };
        errorGenericHandler(err, req, res, next);
        const body = getJsonBody(jsonMock);
        expect(body).not.toHaveProperty("details");
    });

    it("includes the stack trace in non-production environments", async () => {
        process.env.NODE_ENV = "development";
        const { errorGenericHandler } = await import("./errorMiddleware.js");
        const { res, jsonMock } = makeRes();
        errorGenericHandler(new Error("Unexpected"), req, res, next);
        const body = getJsonBody(jsonMock);
        expect(body).toHaveProperty("stack");
    });

    it("hides the message and stack in production for 5xx errors", async () => {
        process.env.NODE_ENV = "production";
        const { errorGenericHandler } = await import("./errorMiddleware.js");
        const { res, jsonMock } = makeRes();
        errorGenericHandler(new Error("Secret internal detail"), req, res, next);
        const body = getJsonBody(jsonMock);
        expect(body["message"]).toBe("Internal server error");
        expect(body).not.toHaveProperty("stack");
    });
});
