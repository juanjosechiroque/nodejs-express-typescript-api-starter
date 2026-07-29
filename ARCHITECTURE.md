# Architecture

This document explains the structure, boundaries, and main trade-offs of this starter.

The example domain is intentionally small. Auth and products demonstrate validation, protected routes, business rules, persistence, testing, and operations without turning the starter into a complete business application.

## Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Runtime          | Node.js 24+ (ESM)                    |
| Language         | TypeScript                           |
| Framework        | Express 5                            |
| Database         | MongoDB via Mongoose 8               |
| Auth             | JWT (jsonwebtoken)                   |
| Validation       | Zod                                  |
| Testing          | Vitest + Supertest                   |
| Containerization | Docker (multi-stage, non-root)       |
| CI/CD            | GitHub Actions                       |
| Code quality     | ESLint + Prettier + Husky pre-commit |

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
{feature}.types.ts        # Feature input/output types when useful
{feature}.test.ts         # Unit or HTTP behavior tests (Vitest + Supertest)
```

Support modules without HTTP endpoints omit `router` and `controller` until routes are needed.

## Feature scope

Auth only exposes signup and login. That is enough for the starter to issue JWTs and protect routes without turning the user module into a full account-management feature. The user module stays internal and handles credentials, password hashing, user status, and email lookup.

The product module is the main example feature. It includes public reads, protected writes, Zod validation, service/repository/model separation, cursor pagination, filters, defaults, and the archived-before-delete rule.

Product write routes require authentication, but they do not enforce ownership or roles. Add those checks in the service layer when the application domain needs them.

## Key trade-offs

| Decision                         | Why now                                                                  | Revisit when                                                 |
| -------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| MongoDB + Mongoose               | Simple local setup and productive document modeling.                     | Relations, reporting, or multi-entity transactions dominate. |
| Repository layer                 | Keeps Mongoose and query strategy out of services.                       | A very small feature does not justify the extra boundary.    |
| JWT + active-user lookup         | Disabled users lose access without waiting for token expiry.             | The lookup becomes an observed authentication bottleneck.    |
| Authentication without ownership | Demonstrates protected routes without inventing an authorization domain. | The product defines ownership or role requirements.          |
| Cursor pagination                | Stable indexed traversal without offset scans.                           | Consumers need arbitrary page jumps or total counts.         |
| In-memory rate limiting          | Adds baseline abuse protection without another operational dependency.   | The API runs on multiple replicas or needs shared quotas.    |
| Mocked Mongoose tests            | Keeps most HTTP tests fast and deterministic.                            | Persistence behavior needs broader real-database coverage.   |

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

## Request lifecycle

A typical protected request follows this path:

```text
HTTP request
  → security headers and request ID
  → structured HTTP logging
  → optional CORS and global rate limiting
  → JSON body limit
  → router
  → authentication and route-specific rate limiting
  → request validation
  → controller → service → repository → model
  → response or centralized error handler
```

Cross-cutting HTTP behavior stays in middleware. Business rules stay in services, and database-specific behavior stays in repositories and models.

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

Errors are resolved centrally into stable JSON responses. Validation, authentication,
not-found, and unexpected failures use distinct status codes and error codes.
Production responses never expose stack traces or internal error details.

## Authentication

Protected routes require a Bearer JWT. Authentication verifies the token and confirms that the user still exists and is active before attaching the identity to the request.

The starter demonstrates route protection, not a complete identity system. Ownership, roles, refresh tokens, recovery, and session management belong to the application built from it.

Public and protected routes are declared explicitly in each router. Authentication endpoints apply a fixed per-IP rate limit.

## Environment configuration

Zod validates all environment variables at startup. Required values fail fast, and feature code imports typed values from `config.ts` instead of reading `process.env`.

## Logging

Logging uses [Pino](https://getpino.io). Use `src/utils/logger.ts` instead of `console.log`.

In development, `pino-pretty` formats the output. In production, logs are written as JSON to stdout. HTTP request logs are handled by `pino-http` and include method, URL, status, response time, and request ID. `LOG_LEVEL` controls verbosity (default: `info`).

## Pagination

List endpoints use cursor pagination over `_id` instead of `skip`. This keeps pagination stable when new documents are inserted and avoids scanning through all previous pages.

The trade-off is that arbitrary page jumps and total counts are not included by default. For admin or reporting screens, the repository can be changed to use `skip` + `countDocuments`.

The product collection has a compound index on `{ status: 1, isFeatured: 1, _id: 1 }`. This supports the common list query: filter by `status`/`isFeatured` and continue from the cursor.

## Testing approach

- Test suites use `Feature:` descriptions and test cases use `Then` descriptions to keep the scenarios readable in a lightweight BDD style.
- Tests live next to the feature they cover: `src/api/{feature}/{feature}.test.ts`
- HTTP behavior is exercised through Supertest against the real Express app.
- Mongoose is mocked at the model level (`src/tests/mongoose-mock.ts`) to keep most tests fast and deterministic without a live database in CI.
- Feature tests should cover the relevant happy path, validation failures, auth failures, not-found cases, and database error paths.

## Known limitations

- Product writes require authentication but do not enforce ownership or roles.
- JWTs do not include refresh-token rotation or individual token revocation.
- Rate limiting is process-local and is not suitable for multiple replicas.
- The active-user lookup adds one persistence read to authenticated requests.
- `price` is a simple number for the reference product; real monetary values should use integer minor units and an ISO currency code.
- The starter has request correlation in logs, but no distributed tracing, metrics, dashboards, or alerts.
- There are no domain workflows such as orders, payments, subscriptions, or multi-tenancy.

## Production considerations

When using this starter for a production application, define the following according to its domain and deployment model:

- Ownership, roles, or permissions for protected resources.
- Refresh tokens, token rotation, or another session strategy.
- Shared rate limiting for multi-replica deployments.
- Metrics, distributed tracing, dashboards, and alerting.
- Secret management and key rotation.
- MongoDB backup, replica-set, and recovery policies.
- API versioning and deprecation rules.
- Database operation timeouts and resource limits.

## Container runtime

The Docker image uses a multi-stage build and runs as a non-root user. On `SIGTERM` or `SIGINT`, the server stops accepting requests, closes MongoDB connections, and exits after active work finishes or the shutdown timeout is reached.
