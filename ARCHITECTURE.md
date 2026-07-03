# Architecture

This document describes the structure, conventions, and design decisions behind this project. It is intended for contributors and anyone evaluating the codebase.

## Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Runtime          | Node.js 24+ (ESM)                    |
| Language         | TypeScript                           |
| Framework        | Express 5                            |
| Database         | MongoDB via Mongoose 8               |
| Auth             | JWT (jsonwebtoken)                   |
| Validation       | Zod                                  |
| Testing          | Jest + Supertest                     |
| Containerization | Docker (multi-stage, non-root)       |
| CI/CD            | GitHub Actions                       |
| Code quality     | ESLint + Prettier + Husky pre-commit |

## Project structure

```
src/
├── api/                  # Feature modules (one folder per domain)
│   ├── auth/
│   ├── health/
│   ├── product/          # Example CRUD feature
│   └── user/             # Support module (no HTTP routes yet)
├── middleware/           # Shared Express middleware
├── tests/                # Shared test helpers and mocks
└── utils/                # Shared utilities
index.ts                  # Server entrypoint
src/app.ts                # Express app setup
src/router.ts             # Versioned API router (mounted under /v1)
src/config.ts             # Environment variable validation and exports
src/database.ts           # MongoDB connection
src/errors.ts             # Typed error factories
```

## Feature module pattern

Each domain feature is self-contained in `src/api/{feature}/`:

```
{feature}.router.ts       # Routes + middleware wiring
{feature}.controller.ts   # HTTP layer: reads req, calls service, sends response
{feature}.service.ts      # Business logic and orchestration
{feature}.validation.ts   # Zod schemas for body, params, and query
{feature}.dao.ts          # Database access (Mongoose only, no HTTP)
{feature}.model.ts        # Mongoose schema, indexes, serialization
{feature}.types.ts        # Feature input/output types when useful
{feature}.test.ts         # HTTP behavior tests (Jest + Supertest)
```

Support modules without HTTP endpoints omit `router` and `controller` until routes are needed.

## Layer responsibilities and data flow

```
router → controller → service → dao → model
```

| Layer        | Responsibility                                                       | Must not                       |
| ------------ | -------------------------------------------------------------------- | ------------------------------ |
| `router`     | Declare routes, attach middleware, wrap handlers with `asyncHandler` | Contain logic                  |
| `controller` | Read `req`, call service, send response via `sendResponse()`         | Touch the database             |
| `service`    | Business rules, orchestration, error throwing                        | Import `req`, `res`, or `next` |
| `dao`        | All Mongoose queries                                                 | Contain business logic         |
| `model`      | Schema definition, indexes, `toJSON` transforms                      | Contain query logic            |

Controllers never access the database directly. Services never reference Express objects.

## Request validation

Validation uses Zod middleware applied at the router level before the controller runs:

```js
// validate body
router.post("/", validate(createProductSchema), asyncHandler(createProductHandler));

// validate URL params
router.get("/:id", validateParams(productIdParamSchema), asyncHandler(getProductByIdHandler));

// validate query string — result available at req.validatedQuery
router.get("/", validateQuery(listProductsQuerySchema), asyncHandler(getProductsHandler));
```

Validation errors return `400` with a `details` array identifying each failing field.

## Response shape

All successful responses use `sendResponse()`:

```js
sendResponse(res, status, data, message);
// → { status, message, data }
```

All error responses flow through the centralized `errorGenericHandler` middleware:

```js
// → { status, code, message }
// → { status, code, message, details }  (validation errors)
// → { status, code, message, stack }    (non-production only)
```

Stack traces and internal error details are never exposed in production.

## Error handling

Typed error factories live in `src/errors.ts`:

```js
throw BadRequestError("Invalid input");
throw UnauthorizedError("Token expired", "TOKEN_EXPIRED");
throw NotFoundError("Product not found");
```

Errors propagate to `errorGenericHandler` via `next(err)` or through `asyncHandler`, which catches promise rejections automatically.

JWT errors distinguish between `TOKEN_EXPIRED` and `INVALID_TOKEN` so clients can handle refresh flows correctly.

## Authentication

Protected routes use the `authenticate` middleware, which validates `Authorization: Bearer <token>` and attaches the decoded payload to `req.user`.

Public and protected routes are declared explicitly in each router — no global auth applied by default.

Auth endpoints (`/signup`, `/login`) apply a fixed rate limit (10 requests per 15 minutes per IP). This is intentionally not configurable — it is a security control, not an operational parameter.

## Environment configuration

All environment variables are declared and validated at startup with Zod in `src/config.ts`. Required variables (`MONGODB_URI`, `JWT_SECRET`) cause an immediate process exit if missing or invalid. Feature code imports named constants from `config.ts` — never reads `process.env` directly.

## Logging

Structured JSON logging via [Pino](https://getpino.io). Import `src/utils/logger.ts` and use `logger.info()` / `logger.error()` — never `console.log`. In development, `pino-pretty` formats output automatically. In production, raw JSON goes to stdout for log aggregators. HTTP request logging (method, URL, status, response time) is handled by `pino-http` middleware. `LOG_LEVEL` controls verbosity (default: `info`).

## Pagination

List endpoints use cursor-based pagination over `_id`. MongoDB ObjectIds are monotonically increasing and carry a primary index, so `{ _id: { $gt: cursor } }` is always an O(log n) index range scan — unlike `skip`, which degrades linearly with collection size. It also prevents phantom reads when documents are inserted between pages.

The trade-off is that arbitrary page jumps and result totals are not supported. For admin panels or reporting use cases, swap the DAO to `skip` + `countDocuments`.

## Testing approach

- Tests live next to the feature they cover: `src/api/{feature}/{feature}.test.ts`
- HTTP behavior is tested end-to-end via Supertest against the real Express app
- Mongoose is mocked at the model level (`src/tests/jest-mongoose-mock.ts`) to avoid requiring a live database in CI
- Every feature covers: happy path, validation failures, auth failures, not-found cases, and DB error paths

## Docker

The Dockerfile uses a two-stage build:

1. **build** — installs dependencies, compiles TypeScript to `dist/`, then prunes dev dependencies
2. **production** — copies compiled output and production dependencies, runs as a non-root user (`appuser`)

This keeps the final image minimal and avoids running as root in production.

## Adding a new feature

1. Create `src/api/{feature}/` with the files listed in the feature module pattern above
2. Register the router in `src/router.ts`
3. Add environment variables to `src/config.ts` if needed
4. Write tests covering the HTTP behavior
5. Run `npm run validate && npm run typecheck && npm test` before committing
