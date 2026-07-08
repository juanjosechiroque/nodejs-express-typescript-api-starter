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
    # Edit .env using .env.example as reference.
    ```

4. **Start the development server**

    ```bash
    npm run dev
    ```

    By default the app listens on port 3000.

## Available Scripts

| Script                  | Description             |
| ----------------------- | ----------------------- |
| `npm start`             | Start server            |
| `npm run dev`           | Start dev server        |
| `npm run build`         | Compile TypeScript      |
| `npm run validate`      | ESLint + Prettier check |
| `npm run format`        | Format + ESLint --fix   |
| `npm run seed`          | Seed demo user/products |
| `npm test`              | Vitest                  |
| `npm run test:coverage` | Vitest + coverage       |
| `npm run typecheck`     | TypeScript typecheck    |

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
| `PUT`    | `/v1/products/:id` | Yes           | Update a product.                                 |
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
curl -s -X PUT http://localhost:3000/v1/products/PRODUCT_ID \
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

### Run API + MongoDB with Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Docker Compose starts the API and a local MongoDB container. By default, the API connects to `mongodb://mongo:27017/api_starter` inside the Compose network.

Compose uses `JWT_SECRET` when provided, otherwise it falls back to a demo-only secret long enough to satisfy startup validation. Replace it for real environments.

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

### AI-assisted development

This project includes configuration files for AI coding assistants:

| Tool         | File                                 |
| ------------ | ------------------------------------ |
| Claude Code  | [`CLAUDE.md`](./CLAUDE.md)           |
| OpenAI Codex | [`AGENTS.md`](./AGENTS.md)           |
| Cursor       | [`.cursor/rules/`](./.cursor/rules/) |

These files point to [ARCHITECTURE.md](./ARCHITECTURE.md) so generated changes follow the same project conventions.

## Testing

The test setup uses **Vitest** with explicit imports, **Supertest** for HTTP behavior, and mocked Mongoose models so CI does not require a live database.

```bash
npm run typecheck
npm test
npm run test:coverage
```

Husky runs `npm run validate` automatically on each commit to keep lint and formatting clean.

## Trade-offs

This starter keeps the example domain small on purpose. The product module is enough to show validation, protected writes, repository-backed persistence, cursor pagination, filters, defaults, and one service-level rule: active products must be archived before deletion.

Use it as a base and add your own domain modules under `src/api/`.

## License

MIT.
