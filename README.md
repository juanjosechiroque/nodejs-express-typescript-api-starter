# Node.js Express TypeScript API Starter

An Express 5 + TypeScript starter for REST APIs with MongoDB, JWT auth, Zod validation, structured logging, Docker, and tests.

It includes a small auth flow and a product module that show how routes, validation, auth, persistence, pagination, seed data, and tests fit together.

## Features

- **TypeScript + Express 5** — ESM setup with strict type checks.
- **Validation** — Zod schemas for config, params, query strings, and request bodies.
- **Auth** — JWT signup/login flow with protected product writes.
- **MongoDB** — Mongoose models, cursor pagination, filters, and seed data.
- **Structure** — Feature-based modules with controller, service, repository, validation, and tests.
- **Security basics** — Helmet, CORS, rate limiting, and auth-specific limits.
- **Logging** — Pino logs with `x-request-id` correlation.
- **Workflow** — Vitest, coverage, ESLint, Prettier, Husky, Docker Compose, and GitHub Actions.

## Requirements

- Node.js 24+
- npm
- MongoDB 8.0 or Docker

## Quick Start

1. **Clone the repository**

    ```bash
    git clone <your-repo-url>
    cd nodejs-express-typescript-api-starter
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment**

    ```bash
    cp .env.example .env
    # Generate a local JWT secret and add it to .env:
    openssl rand -base64 48
    ```

    Edit `.env` using `.env.example` as reference. Never commit the generated secret.

4. **Start MongoDB**

    ```bash
    docker compose up -d mongo
    ```

5. **Start the development server**

    ```bash
    npm run dev
    ```

    By default the app listens on port 3000.

## Available Scripts

| Script                     | Description                        |
| -------------------------- | ---------------------------------- |
| `npm start`                | Start server                       |
| `npm run dev`              | Start dev server                   |
| `npm run build`            | Compile TypeScript                 |
| `npm run validate`         | ESLint + Prettier check            |
| `npm run format`           | Format + ESLint --fix              |
| `npm run seed`             | Seed demo user/products            |
| `npm test`                 | Fast tests with mocked persistence |
| `npm run test:integration` | Integration tests with MongoDB     |
| `npm run test:all`         | Fast and integration test suites   |
| `npm run test:coverage`    | Vitest + coverage                  |
| `npm run typecheck`        | TypeScript typecheck               |

## Environment variables

Copy `.env.example` to `.env`. In non-production, variables are loaded with `dotenv` and validated at startup with Zod (see `src/config.ts`).

| Variable                    | Required | Description                                                                                                            |
| --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `PORT`                      | No       | HTTP port (default `3000`).                                                                                            |
| `NODE_ENV`                  | No       | Typical values: `development`, `production`. Affects env loading.                                                      |
| `MONGODB_URI`               | **Yes**  | MongoDB connection string. The app exits at startup if missing or empty.                                               |
| `JWT_SECRET`                | **Yes**  | Secret used to sign JWTs. Must be at least 32 characters.                                                              |
| `JWT_EXPIRATION_TIME`       | No       | JWT lifetime (default `1h`).                                                                                           |
| `CORS_ALLOWED_ORIGINS`      | No       | Comma-separated allowed origins. CORS is only enabled when this is set. Use `*` to allow all origins.                  |
| `RATE_LIMIT_WINDOW_MINUTES` | No       | Length of the sliding window in **minutes**. Must be configured together with `RATE_LIMIT_MAX`.                        |
| `RATE_LIMIT_MAX`            | No       | Max **HTTP requests per IP** allowed inside that window. Must be configured together with `RATE_LIMIT_WINDOW_MINUTES`. |
| `LOG_LEVEL`                 | No       | Pino log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` (default `info`).                                   |

### Rate limiting and horizontal scaling

The default rate limiter stores counters in the application process. This is suitable for local development and single-instance deployments, but it does not enforce a global limit across multiple API instances. Counters are also reset whenever an instance restarts.

For a horizontally scaled production deployment, configure `express-rate-limit` with a shared store such as Redis. The global and authentication-specific limiters must use the same shared infrastructure if their limits need to apply consistently across all instances.

## Security defaults and production responsibilities

The starter provides secure defaults without claiming to be a complete security program:

- JSON request bodies are limited to 10kb to reduce accidental or abusive memory consumption.
- Helmet sets common HTTP security headers, including content type, framing, and content security protections.
- CORS is disabled unless `CORS_ALLOWED_ORIGINS` is configured. Prefer an explicit allowlist in production; `*` should only be used when the API is intentionally public and does not rely on browser credentials.
- Authentication endpoints allow 10 attempts per 15 minutes per IP. An optional global limiter can be configured with `RATE_LIMIT_WINDOW_MINUTES` and `RATE_LIMIT_MAX`.
- Structured logs redact common password, token, authorization, and cookie fields. Application code must still avoid logging complete request bodies or arbitrary secret-bearing objects.
- Production errors hide stack traces and internal messages.
- The production container runs as a non-root user.
- CI fails when `npm audit` reports a high or critical vulnerability.

Access tokens are short-lived JWTs. Refresh tokens, session management, token rotation, revocation lists, password reset, email verification, MFA, and account recovery are intentionally outside this starter's scope. Applications that need those capabilities should implement them as a complete threat-modeled flow rather than adding a partial refresh endpoint.

Secrets must come from the deployment platform's secret manager or protected environment variables. Generate development secrets with `openssl rand -base64 48`; never reuse example values, bake secrets into an image, include them in logs, or commit `.env` files. Rotate a secret immediately if it may have been exposed.

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

## API Examples

Main flow with `curl` (assumes the API on `http://localhost:3000`):

The login example uses `jq` to extract the JWT.

```bash
# Sign up
curl -s -X POST http://localhost:3000/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"DemoPassword123!"}'

# Log in and save the JWT
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"DemoPassword123!"}' \
  | jq -r '.data')

# Create a product
curl -s -X POST http://localhost:3000/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Starter Tee","price":29.99,"stock":50,"status":"draft"}'

# List active featured products
curl -s "http://localhost:3000/v1/products?status=active&isFeatured=true"

# Update a product (archive before delete if it was active)
curl -s -X PATCH http://localhost:3000/v1/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"archived"}'

# Delete a product
curl -s -X DELETE http://localhost:3000/v1/products/PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Replace `PRODUCT_ID` with a MongoDB ObjectId from a create or list response.

## Docker

### Build and run the API image

```bash
docker build -t nodejs-express-typescript-api-starter .
docker run -p 3000:3000 --env-file .env nodejs-express-typescript-api-starter
```

The image uses a multi-stage build and runs as a non-root user in production.

The API handles `SIGTERM` and `SIGINT` by stopping new HTTP connections, closing idle keep-alive connections, waiting for active requests, and then disconnecting from MongoDB. A 10-second timeout forces the process to exit if graceful shutdown cannot complete. Docker Compose allows a 15-second grace period before the container is forcibly stopped.

### Run API + MongoDB with Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Docker Compose starts the API and a local MongoDB container. By default, the API connects to `mongodb://mongo:27017/api_starter` inside the Compose network.

Both containers expose health checks. MongoDB is checked with `db.adminCommand('ping')`, while the API checks `/v1/health`. Compose waits for MongoDB to become healthy before starting the API.

Compose requires `JWT_SECRET` to be set in `.env` and refuses to start without it. This avoids silently running the production-mode container with a known example secret.

To use MongoDB Atlas or another remote MongoDB, set `COMPOSE_MONGODB_URI` in `.env`; no change to `docker-compose.yml` is required.

```env
COMPOSE_MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
```

Useful commands:

```bash
docker compose up --build
docker compose down
docker compose down -v
```

Use `docker compose down -v` only when you want to remove the local MongoDB volume and start with an empty database.

## Demo data

Seed a local or Compose-backed database manually:

```bash
npm run seed
```

The seed is idempotent and creates or updates:

- demo user: `demo@example.com`
- demo password: `DemoPassword123!`
- five products: three `active`, one `draft`, one `archived`, covering stock and `isFeatured`

If you are using Docker Compose, keep Compose running and set your local `.env` `MONGODB_URI` to `mongodb://localhost:27017/api_starter` before running the seed from your host machine.

## Response shape

**Success**

```json
{
    "status": 200,
    "message": "success",
    "data": {}
}
```

**Error**

```json
{
    "status": 400,
    "code": "BadRequestError",
    "message": "Validation failed",
    "details": [{ "field": "price", "error": "Too small: expected number to be >0" }]
}
```

Stack traces are included in non-production environments only and never exposed in production.

## Development

### Adding new features

Features live under `src/api/<feature>/` and are wired in `src/router.ts`.

Use `src/api/product/` as the reference module for CRUD routes, Zod validation, protected writes, service/repository/model separation, pagination, filters, and tests.

Layer responsibilities and coding conventions are in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Testing

Fast tests mock persistence for quick feedback. Integration tests use Testcontainers and MongoDB 8.0 for critical persistence and API contract paths; Docker must be running.

```bash
npm test
npm run test:integration
npm run test:all
npm run test:coverage
```

## Technical decisions and trade-offs

| Decision                              | Benefit                                                                                            | Cost or limitation                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| MongoDB with Mongoose                 | Simple local setup and productive document modeling.                                               | Relational integrity, joins, and cross-document consistency remain application concerns. |
| Cursor pagination over `_id`          | Stable, indexed pagination without increasingly expensive offsets.                                 | No arbitrary page jumps or total count by default.                                       |
| JWT with an active-user lookup        | Disabled users lose access without waiting for token expiry.                                       | Every authenticated request depends on a database read.                                  |
| In-memory rate limiting               | Keeps local development dependency-free.                                                           | Counters are not shared across processes and reset on restart.                           |
| Mocked HTTP tests plus Testcontainers | Fast feedback with targeted verification against real MongoDB.                                     | Mocks can diverge from Mongoose, while integration tests require Docker and run slower.  |
| Small Product domain                  | Demonstrates the extension pattern without turning the starter into a sample business application. | Pricing, authorization, and lifecycle rules are intentionally simplified.                |

## Known limitations

- Product writes require authentication but do not enforce ownership or roles.
- `price` uses a JavaScript number for demonstration; real monetary values should use integer minor units plus a currency code.
- There is no application cache. MongoDB and the active-user lookup are the main pressure points under load.
- Metrics, distributed tracing, refresh tokens, account recovery, and multi-instance rate limiting are outside the starter's scope.
- Dependency updates are manual. CI detects high and critical advisories with `npm audit` but does not create upgrade pull requests.
