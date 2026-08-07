# Node.js Express TypeScript API Starter

An Express 5 + TypeScript starter for REST APIs with MongoDB, JWT auth, Zod validation, structured logging, Docker, and tests.

The intentionally small example includes an auth flow and a Product reference CRUD module. It
shows how routes, validation, auth, persistence, pagination, seed data, and tests fit together
without introducing application-specific roles, ownership, orders, or payments.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions and trade-offs.

## Features

- **TypeScript + Express 5** — ESM setup with strict type checks.
- **Validation** — Zod schemas for config, params, query strings, and request bodies.
- **Auth** — JWT signup/login flow with protected product writes.
- **MongoDB** — Mongoose models, lean reads, cursor pagination, filters, and seed data.
- **Response contracts** — Explicit feature mappers expose public DTOs without persistence-only fields.
- **Structure** — Feature-based modules with controller, service, repository, validation, and tests.
- **Security basics** — Helmet, CORS, rate limiting, and auth-specific limits.
- **Logging** — Pino logs with `x-request-id` correlation.
- **Workflow** — Vitest, Testcontainers, coverage, ESLint, Prettier, Husky, Docker Compose, and GitHub Actions.

## Requirements

- Node.js 24+
- npm
- Docker and Docker Compose (recommended for local MongoDB)

## Quick Start

1. **Clone the repository**

    ```bash
    git clone https://github.com/juanjosechiroque/nodejs-express-typescript-api-starter.git
    cd nodejs-express-typescript-api-starter
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment**

    ```bash
    cp .env.example .env
    # Edit .env using .env.example as reference.
    ```

4. **Start MongoDB**

    The default local development flow uses Docker for MongoDB:

    ```bash
    docker compose up -d mongo
    ```

    To use an existing local MongoDB instance or a remote database such as MongoDB Atlas, set `MONGODB_URI` in `.env` instead. Docker is not required for that option.

5. **Start the development server**

    ```bash
    npm run dev
    ```

    By default the app listens on port 3000.

    Verify from another terminal:

    ```bash
    curl http://localhost:3000/v1/health
    ```

## Available Scripts

| Script                     | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `npm start`                | Run the compiled production build              |
| `npm run dev`              | Start the API in development mode              |
| `npm run build`            | Compile TypeScript to `dist/`                  |
| `npm run validate`         | Check linting and formatting                   |
| `npm run format`           | Apply formatting and lint fixes                |
| `npm run seed`             | Reset the demo user and upsert demo products   |
| `npm test`                 | Run the test suite once                        |
| `npm run test:all`         | Run unit/HTTP and MongoDB integration suites   |
| `npm run test:coverage`    | Run the test suite with coverage               |
| `npm run test:integration` | Run real MongoDB tests (Docker required)       |
| `npm run typecheck`        | Check TypeScript types without emitting output |

## Environment variables

Copy `.env.example` to `.env`. In non-production, variables are loaded with `dotenv` and
validated at startup with Zod (see `src/config.ts`).

### Minimum development configuration

Only these values are required to start the API:

| Variable      | Description                                      |
| ------------- | ------------------------------------------------ |
| `MONGODB_URI` | MongoDB connection string.                       |
| `JWT_SECRET`  | JWT signing secret, with at least 32 characters. |

### Optional configuration

| Variable                    | Description                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `PORT`                      | HTTP port (default `3000`).                                                                           |
| `NODE_ENV`                  | Runtime environment (default `development`).                                                          |
| `JWT_EXPIRATION_TIME`       | Token lifetime (default `1h`).                                                                        |
| `CORS_ALLOWED_ORIGINS`      | Comma-separated allowed origins. CORS is only enabled when this is set. Use `*` to allow all origins. |
| `TRUST_PROXY_HOPS`          | Exact number of trusted proxy hops in front of Express (default `0`).                                 |
| `RATE_LIMIT_WINDOW_MINUTES` | Length of the sliding window in minutes. Configure it together with `RATE_LIMIT_MAX`.                 |
| `RATE_LIMIT_MAX`            | Max HTTP requests per IP in that window. Configure it together with `RATE_LIMIT_WINDOW_MINUTES`.      |
| `LOG_LEVEL`                 | Pino level: `trace`, `debug`, `info`, `warn`, `error`, or `fatal` (default `info`).                   |

### Reverse proxy configuration

Express derives `req.ip` and `req.protocol` from the socket by default. `TRUST_PROXY_HOPS`
allows it to use `X-Forwarded-For` and `X-Forwarded-Proto` only when the application runs behind
a known proxy topology. This matters because authentication logs and the rate limiter use the
derived client IP.

| Deployment path                    | Value |
| ---------------------------------- | ----- |
| Client → API                       | `0`   |
| Client → load balancer → API       | `1`   |
| Client → CDN → load balancer → API | `2`   |

Use the exact number of controlled hops that every request path traverses. Do not increase the
value merely to accommodate a possible longer path: if a shorter path can reach the API, a client
may be able to supply a trusted forwarded address. The default local and Docker Compose setup
exposes the API directly, so it keeps `TRUST_PROXY_HOPS=0`.

## Request tracing

Requests include a correlation ID for logs:

- Send `x-request-id` to propagate an ID from a client, gateway, or upstream service.
- If the header is omitted, the API generates a UUID automatically.
- The same value is always returned in the response `x-request-id` header.
- Pino HTTP logging uses that ID as `req.id`, so all request logs for a single call share the same identifier.

## API Endpoints

API details are available in [openapi.yaml](./openapi.yaml).

| Method   | Endpoint           | Auth required | Description                                       |
| -------- | ------------------ | ------------- | ------------------------------------------------- |
| `GET`    | `/`                | No            | Basic API status check.                           |
| `GET`    | `/v1/health`       | No            | Health check with database status.                |
| `POST`   | `/v1/auth/signup`  | No            | Register a user and return a JWT.                 |
| `POST`   | `/v1/auth/login`   | No            | Authenticate a user and return a JWT.             |
| `GET`    | `/v1/products`     | No            | List products with cursor pagination and filters. |
| `GET`    | `/v1/products/:id` | No            | Get a product by ID.                              |
| `POST`   | `/v1/products`     | Yes           | Create a product.                                 |
| `PATCH`  | `/v1/products/:id` | Yes           | Partially update a product.                       |
| `DELETE` | `/v1/products/:id` | Yes           | Delete a product if it is not active.             |

Protected product routes expect `Authorization: Bearer <jwt>`. List and get-by-id stay public.

## Response shape

Successful responses use a common envelope:

```json
{
    "status": 200,
    "message": "success",
    "data": {}
}
```

Errors add a stable `code` and, for validation failures, a `details` array. See
[openapi.yaml](./openapi.yaml) for the complete request and response contract.

## API Examples

Quick check:

```bash
curl http://localhost:3000/v1/health
curl "http://localhost:3000/v1/products?status=active&isFeatured=true"
```

Representative requests for authentication, Product CRUD, filters, cursor pagination, and
error cases are available in [docs/examples.md](./docs/examples.md). The complete contract is
defined in [openapi.yaml](./openapi.yaml).

## Docker

Use this command to verify the production Docker image locally. For day-to-day development, run only MongoDB with Docker and start the API with `npm run dev`.

### Verify the containerized stack

```bash
cp .env.example .env
docker compose up --build
```

Docker Compose starts the production API image and a local MongoDB container. By default, the API connects to `mongodb://mongo:27017/api_starter` inside the Compose network. The image uses a multi-stage build and runs as a non-root user.

Compose does not load demo data automatically. With the stack running, execute `npm run seed` from the host when you want the demo user and products.

Set a strong `JWT_SECRET` in `.env` before using the stack outside local development.

Useful commands:

```bash
docker compose up --build
docker compose down
docker compose down -v
```

Use `docker compose down -v` only when you want to remove the local MongoDB volume and start with an empty database.

## Development

### Adding new features

Features live under `src/api/<feature>/` and are wired in `src/router.ts`.

Use `src/api/product/` as the reference module for CRUD routes, Zod validation, protected writes, service/repository/model separation, pagination, filters, and tests.

Layer responsibilities and coding conventions are in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Testing

The default `npm test` suite uses **Vitest**, **Supertest**, and mocked Mongoose models for fast,
deterministic HTTP behavior checks. `npm run test:integration` starts a disposable MongoDB 8
replica set with **Testcontainers**, synchronizes the real Mongoose indexes, and verifies unique
email enforcement, password hooks, compound indexes, cursor pagination, filters, updates, and
conditional deletion against the database engine. Docker must be running for that suite.

Run both layers before a database-related change:

```bash
npm run test:all
```

CI runs the coverage and integration commands separately, and Testcontainers removes the database
container after the integration suite completes.

Husky runs `npm run validate` automatically on each commit to keep lint and formatting clean.

## License

MIT.
