import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { Request, Response } from "express";
import { z } from "zod";
import { validate, validateParams, validateQuery } from "./validationMiddleware.js";

const next = vi.fn();

type MockRes = Response & { status: Mock; json: Mock };

function makeRes(): MockRes {
    const status: Mock = vi.fn();
    const json: Mock = vi.fn();
    const res = { status, json };
    status.mockReturnValue(res);
    json.mockReturnValue(res);
    return res as unknown as MockRes;
}

beforeEach(() => next.mockClear());

const schema = z.object({ name: z.string() });

describe("validate (body)", () => {
    it("calls next with no error when body is valid", () => {
        const req = { body: { name: "test" } } as unknown as Request;
        validate(schema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
    });

    it("calls next with BadRequestError when body is invalid", () => {
        const req = { body: {} } as unknown as Request;
        validate(schema)(req, makeRes(), next);
        const err = next.mock.calls[0]?.[0] as { statusCode: number; details: unknown[] };
        expect(err.statusCode).toBe(400);
        expect(err.details).toBeInstanceOf(Array);
    });

    it("handles missing body gracefully", () => {
        const req = {} as unknown as Request;
        validate(schema)(req, makeRes(), next);
        const err = next.mock.calls[0]?.[0] as { statusCode: number };
        expect(err.statusCode).toBe(400);
    });
});

describe("validateParams", () => {
    const paramSchema = z.object({ id: z.string() });

    it("calls next with no error when params are valid", () => {
        const req = { params: { id: "abc123" } } as unknown as Request;
        validateParams(paramSchema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
    });

    it("calls next with BadRequestError when params are invalid", () => {
        const req = { params: {} } as unknown as Request;
        validateParams(paramSchema)(req, makeRes(), next);
        const err = next.mock.calls[0]?.[0] as { statusCode: number; details: unknown[] };
        expect(err.statusCode).toBe(400);
        expect(err.details).toBeInstanceOf(Array);
    });

    it("handles missing params gracefully", () => {
        const req = {} as unknown as Request;
        validateParams(paramSchema)(req, makeRes(), next);
        const err = next.mock.calls[0]?.[0] as { statusCode: number };
        expect(err.statusCode).toBe(400);
    });
});

describe("validateQuery", () => {
    const querySchema = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    });

    it("calls next with no error and sets req.validatedQuery when query is valid", () => {
        const req = { query: { page: "2", limit: "5" } } as unknown as Request;
        validateQuery(querySchema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
        expect((req as Request & { validatedQuery: unknown }).validatedQuery).toEqual({
            page: 2,
            limit: 5,
        });
    });

    it("applies defaults when query is empty", () => {
        const req = { query: {} } as unknown as Request;
        validateQuery(querySchema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
        expect((req as Request & { validatedQuery: unknown }).validatedQuery).toEqual({
            page: 1,
            limit: 10,
        });
    });

    it("calls next with BadRequestError when query is invalid", () => {
        const req = { query: { page: "0" } } as unknown as Request;
        validateQuery(querySchema)(req, makeRes(), next);
        const err = next.mock.calls[0]?.[0] as { statusCode: number; details: unknown[] };
        expect(err.statusCode).toBe(400);
        expect(err.details).toBeInstanceOf(Array);
    });

    it("handles missing query gracefully", () => {
        const req = {} as unknown as Request;
        validateQuery(querySchema)(req, makeRes(), next);
        expect(next).toHaveBeenCalledWith();
        expect((req as Request & { validatedQuery: unknown }).validatedQuery).toEqual({
            page: 1,
            limit: 10,
        });
    });
});
