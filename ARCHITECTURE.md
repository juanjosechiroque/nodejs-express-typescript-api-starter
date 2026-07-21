# Architecture

This document explains how the project is organized and how to extend it without breaking the existing conventions.

## Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Runtime          | Node.js 24+ (ESM)                    |
| Language         | TypeScript 6                         |
| Framework        | Express 5                            |
| Database         | MongoDB via Mongoose 9               |
| Auth             | JWT (jsonwebtoken)                   |
| Validation       | Zod                                  |
| Testing          | Vitest + Supertest                   |
| Containerization | Docker (multi-stage, non-root)       |
| CI/CD            | GitHub Actions                       |
| Code quality     | ESLint + Prettier + Husky pre-commit |

## Core decisions

- **Express and feature modules:** Express keeps the HTTP layer small and explicit. The module pattern adds some files per feature, but preserves clear ownership as the codebase grows.
- **MongoDB and Mongoose:** The document model keeps setup and CRUD development simple. Applications that require strong relational constraints, complex joins, or multi-entity reporting should evaluate PostgreSQL instead.
- **TypeScript 6:** The project favors the stable compiler and lint ecosystem over early adoption of TypeScript 7.
- **Stable public DTOs:** Mappers prevent MongoDB fields from leaking into API contracts. This adds a translation step but allows persistence models to evolve independently.

## Project structure

```
src/
├── api/                  # Feature modules (one folder per domain)
│   ├── auth/
│   ├── health/
│   ├── product/          # Small reference CRUD feature
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
{feature}.repository.ts   # Persistence operations (Mongoose hidden from services)
{feature}.model.ts        # Mongoose schema, indexes, serialization
{feature}.mapper.ts       # Persistence objects to stable public DTOs, when needed
{feature}.types.ts        # Feature input/output types when useful
{feature}.test.ts         # Unit or HTTP behavior tests (Vitest + Supertest)
```

Support modules without HTTP endpoints omit `router` and `controller` until routes are needed.

## Feature scope

Auth only exposes signup and login. That is enough for the starter to issue JWTs and protect routes without turning the user module into a full account-management feature. The user module stays internal and handles credentials, password hashing, user status, and email lookup.

The product module is the main example feature. It includes public reads, protected writes, Zod validation, service/repository/model separation, cursor pagination, filters, defaults, and the archived-before-delete rule.

Product write routes require authentication to demonstrate how endpoints are protected. Authentication proves who the caller is; it does not decide which products that caller may change. Add ownership or role checks in the service layer when the adopting domain requires them.

Product `price` is a JavaScript number to keep the example compact. Applications that perform monetary calculations should store integer minor units with an explicit currency code; use Decimal128 only when the domain requires variable precision.

## Layer responsibilities and data flow

```
router → controller → service → repository → model
```

| Layer        | Responsibility                                                       | Must not                       |
| ------------ | -------------------------------------------------------------------- | ------------------------------ |
| `router`     | Declare routes, attach middleware, wrap handlers with `asyncHandler` | Contain logic                  |
| `controller` | Read `req`, call service, send response via `sendResponse()`         | Touch the database             |
| `service`    | Business rules, orchestration, error throwing                        | Import `req`, `res`, or `next` |
| `repository` | Persistence operations and query strategy                            | Contain business logic         |
| `model`      | Schema definition, indexes, `toJSON` transforms                      | Contain query logic            |

Controllers never access the database directly. Services never reference Express objects or Mongoose APIs directly.

Persistence-specific names and types must not leak into public responses. Features that need translation expose stable DTOs through a mapper; for example, Product maps MongoDB `_id`, `created_at`, and `updated_at` to `id`, `createdAt`, and `updatedAt` before data leaves the repository boundary.

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

Keep small business rules in the service layer. Example: active products must be archived before deletion.

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

## API contract

API details live in `openapi.yaml`. Update it when routes, validation schemas, or response shapes change.

## Error handling

Typed error factories live in `src/errors.ts`:

```js
throw BadRequestError("Invalid input");
throw UnauthorizedError("Token expired", "TOKEN_EXPIRED");
throw NotFoundError("Product not found");
```

Errors propagate to `errorGenericHandler` via `next(err)` or through `asyncHandler`, which catches promise rejections automatically.

JWT errors distinguish between `TOKEN_EXPIRED` and `INVALID_TOKEN` so clients can prompt for re-authentication appropriately.

## Authentication

Protected routes use `authenticate`. It validates `Authorization: Bearer <token>`, verifies the JWT with HS256, checks that the user still exists and is active, and then attaches the decoded payload to `req.user`.

JWTs are still stateless. The active-user check gives the API a simple way to disable access after a user is deactivated, without adding token blacklists, refresh-token storage, or session tracking.

The active-user check also puts MongoDB on the critical path for every authenticated request. At higher load, measure this lookup before introducing a short-lived cache or session store.

Refresh tokens, token rotation, revocation lists, password reset, email verification, MFA, and account recovery are intentionally out of scope. These features require complete storage, rotation, reuse-detection, expiry, revocation, and recovery policies; applications should not add a partial refresh-token flow.

Public and protected routes are declared explicitly in each router — no global auth applied by default.

Auth endpoints (`/signup`, `/login`) apply a fixed rate limit (10 requests per 15 minutes per IP). This is intentionally not configurable — it is a security control, not an operational parameter.

Both the authentication limiter and the optional global limiter use in-memory counters by default. This keeps local setup dependency-free, but counters are isolated per process and reset on restart. Multi-instance production deployments must configure a shared rate-limit store, such as Redis, to enforce limits consistently across replicas.

## Operational security

- Express accepts JSON bodies up to 10kb.
- Helmet applies HTTP security headers before application routes.
- CORS is opt-in and should use an explicit production allowlist.
- Pino redacts common password, token, authorization, and cookie paths as defense in depth. Callers must still log allowlisted fields instead of arbitrary request bodies.
- Production error responses hide internal messages and stack traces.
- The Docker production stage runs as the non-root `appuser`.
- Secrets are validated at startup and must be supplied by the runtime environment; Docker Compose does not provide a fallback JWT secret.
- CI rejects high or critical npm audit findings.

Dependency upgrades are intentionally manual. The audit gate detects known advisories during CI, but maintainers remain responsible for reviewing and scheduling version updates.

## Environment configuration

All environment variables are declared and validated at startup with Zod in `src/config.ts`. Required variables (`MONGODB_URI`, `JWT_SECRET`) cause an immediate process exit if missing or invalid. Feature code imports named constants from `config.ts` — never reads `process.env` directly.

## Logging

Logging uses [Pino](https://getpino.io). Use `src/utils/logger.ts` instead of `console.log`.

In development, `pino-pretty` formats the output. In production, logs are written as JSON to stdout. HTTP request logs are handled by `pino-http` and include method, URL, status, response time, and request ID. `LOG_LEVEL` controls verbosity (default: `info`).

## Pagination

List endpoints use cursor pagination over `_id` instead of `skip`. This keeps pagination stable when new documents are inserted and avoids scanning through all previous pages.

The trade-off is that arbitrary page jumps and total counts are not included by default. For admin or reporting screens, the repository can be changed to use `skip` + `countDocuments`.

The product collection has a compound index on `{ status: 1, isFeatured: 1, _id: 1 }`. This supports the common list query: filter by `status`/`isFeatured` and continue from the cursor.

## Testing approach

- Fast tests live next to the feature they cover: `src/api/{feature}/{feature}.test.ts`.
- Supertest exercises the real Express middleware and routing stack while Mongoose is mocked at the model boundary.
- Persistence integration tests live under `src/tests/integration/` and use Testcontainers with MongoDB 8.0. They verify indexes, hooks, validators, serialization, filters, and cursor pagination against the real driver.
- Product contract tests run Express and MongoDB together to ensure create, list, get, and patch return the same `ProductDTO`, independent of Mongoose document or `lean()` behavior.
- Fast coverage and integration tests remain separate: `npm run test:coverage` enforces coverage thresholds, while `npm run test:integration` requires Docker and validates persistence behavior.

Mocks keep the default suite fast but can diverge from Mongoose behavior. Integration tests cover the persistence and contract paths where that divergence would be most costly rather than duplicating every unit test against MongoDB.

## Scaling boundaries

The starter targets local development and a modest single-instance deployment. It can run multiple API replicas, but production scaling requires a shared rate-limit store. MongoDB capacity and the authenticated-user lookup are the first expected bottlenecks; add caching only after measuring them. Service metrics, distributed tracing, queues, and multi-region concerns are intentionally left to the adopting application.

## Docker

The Dockerfile uses a two-stage build:

1. **build** — installs dependencies, compiles TypeScript to `dist/`, then prunes dev dependencies
2. **production** — copies compiled output and production dependencies, runs as a non-root user (`appuser`)

This keeps the final image minimal and avoids running as root in production.

CI builds and runs the image locally to validate the production artifact, but it does not publish or deploy it. An adopting project should replace `IMAGE_NAME` with its registry repository, authenticate using short-lived CI credentials, push immutable commit tags, and deploy through its own environment-specific workflow.

## Adding a new feature

1. Create `src/api/{feature}/` with the files listed in the feature module pattern above
2. Register the router in `src/router.ts`
3. Add environment variables to `src/config.ts` if needed
4. Write tests covering the HTTP behavior
5. Run `npm run validate && npm run typecheck && npm run build && npm run test:all` before committing
