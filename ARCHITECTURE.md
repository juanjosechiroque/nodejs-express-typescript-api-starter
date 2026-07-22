# Architecture

This starter keeps HTTP, business rules, and persistence separate so features can grow without coupling controllers to MongoDB or Express details.

## Stack

| Layer      | Choice                            |
| ---------- | --------------------------------- |
| Runtime    | Node.js 24, TypeScript 6, ESM     |
| HTTP       | Express 5, Zod                    |
| Data       | MongoDB 8, Mongoose 9             |
| Operations | Pino, Docker, GitHub Actions      |
| Testing    | Vitest, Supertest, Testcontainers |

## Structure

```text
src/
├── api/          # Feature modules: auth, health, product, user
├── middleware/   # Cross-cutting HTTP behavior
├── tests/        # Shared helpers and integration tests
└── utils/        # Logging, JWT, responses, async handling
```

Each HTTP feature follows this flow:

```text
router → controller → service → repository → model
```

- Routers wire middleware and handlers.
- Controllers translate HTTP requests and responses.
- Services hold business rules and never import Express or Mongoose.
- Repositories own query strategy.
- Models define schemas, indexes, and persistence serialization.

Public responses use DTO mappers when persistence fields must not become part of the API contract. Update [openapi.yaml](./openapi.yaml) whenever routes, validation, or response shapes change.

## Decisions and trade-offs

| Decision                           | Why now                                                                  | Revisit when                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| MongoDB + Mongoose                 | Simple local setup and productive document modeling.                     | Relations, reporting, or multi-entity transactions dominate.                    |
| Cursor pagination                  | Stable indexed traversal without offset scans.                           | Consumers need arbitrary page jumps or total counts.                            |
| JWT + active-user lookup           | Disabled users lose access without waiting for token expiry.             | The lookup becomes an observed authentication bottleneck.                       |
| In-memory rate limiting            | Keeps the starter dependency-free.                                       | The API runs on more than one replica; use a shared store such as Redis.        |
| Authentication without ownership   | Demonstrates protected routes without inventing an authorization domain. | The product defines ownership or role requirements.                             |
| `price` as a number                | Keeps the reference Product feature compact.                             | Handling money: use integer minor units and an ISO currency code.               |
| Mocked fast tests + Testcontainers | Fast feedback plus real MongoDB coverage where it matters.               | Persistence behavior becomes broad enough to justify more integration coverage. |

## Operational defaults

- Zod validates environment variables and request inputs before feature logic runs.
- Helmet, an opt-in CORS allowlist, a 10 KB JSON body limit, and Pino redaction provide baseline HTTP security.
- Authentication endpoints have a fixed per-IP limit; the optional global limiter is process-local.
- Logs are JSON in production and include an `x-request-id` correlation ID.
- The Docker image runs as a non-root user and shuts down HTTP and MongoDB connections gracefully.
- CI runs audit, formatting, type checks, tests, integration tests, and an image build; it validates an artifact but does not publish or deploy one.

## Adding a feature

1. Create the feature module under `src/api/{feature}/`.
2. Add validation, service rules, and repository queries in their respective layers.
3. Register the router in `src/router.ts`.
4. Cover HTTP behavior with fast tests; add integration coverage for persistence behavior with meaningful MongoDB risk.
5. Update `openapi.yaml` if the HTTP contract changes.

Before committing, run:

```bash
npm run validate && npm run typecheck && npm run build && npm run test:all
```
