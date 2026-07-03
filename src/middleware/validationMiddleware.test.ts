import { beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { validate, validateParams, validateQuery } from "./validationMiddleware.js";

const next = vi.fn();

function makeRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

beforeEach(() => next.mockClear());

const schema = z.object({ name: z.string() });

describe("validate (body)", () => {
    test("calls next with no error when body is valid", () => {
        const req = { body: { name: "test" } };
        validate(schema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
    });

    test("calls next with BadRequestError when body is invalid", () => {
        const req = { body: {} };
        validate(schema)(req, makeRes(), next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(400);
        expect(err.details).toBeInstanceOf(Array);
    });

    test("handles missing body gracefully", () => {
        const req = {};
        validate(schema)(req, makeRes(), next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(400);
    });
});

describe("validateParams", () => {
    const paramSchema = z.object({ id: z.string() });

    test("calls next with no error when params are valid", () => {
        const req = { params: { id: "abc123" } };
        validateParams(paramSchema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
    });

    test("calls next with BadRequestError when params are invalid", () => {
        const req = { params: {} };
        validateParams(paramSchema)(req, makeRes(), next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(400);
        expect(err.details).toBeInstanceOf(Array);
    });

    test("handles missing params gracefully", () => {
        const req = {};
        validateParams(paramSchema)(req, makeRes(), next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(400);
    });
});

describe("validateQuery", () => {
    const querySchema = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    });

    test("calls next with no error and sets req.validatedQuery when query is valid", () => {
        const req = { query: { page: "2", limit: "5" } };
        validateQuery(querySchema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
        expect(req.validatedQuery).toEqual({ page: 2, limit: 5 });
    });

    test("applies defaults when query is empty", () => {
        const req = { query: {} };
        validateQuery(querySchema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
        expect(req.validatedQuery).toEqual({ page: 1, limit: 10 });
    });

    test("calls next with BadRequestError when query is invalid", () => {
        const req = { query: { page: "0" } };
        validateQuery(querySchema)(req, makeRes(), next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(400);
        expect(err.details).toBeInstanceOf(Array);
    });

    test("handles missing query gracefully", () => {
        const req = {};
        validateQuery(querySchema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
        expect(req.validatedQuery).toEqual({ page: 1, limit: 10 });
    });
});
