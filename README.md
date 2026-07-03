# Node.js Express TypeScript API Starter

A production-minded **TypeScript REST API starter** built with **Express 5**, **MongoDB**, JWT auth, validation, tests, and practical defaults for service-oriented backends.

## Features

- **TypeScript (ESM)** — strict runtime code compiled to `dist/`
- **Express 5** — HTTP API and middleware
- **JWT** — token-based auth
- **Zod** — type-safe request and environment validation
- **Vitest** — unit and API tests next to each feature
- **ESLint & Prettier** — enforced style and static checks
- **Husky** — `npm run validate` on pre-commit
- **Security** — Helmet, CORS, rate limiting, per-route auth limits
- **Structured logging** — Pino (JSON in production, pretty-printed in development)
- **Health** — monitoring endpoint
- **CI/CD** — GitHub Actions validates, tests, and builds the Docker image on `main`

## Architecture highlights

- **Feature modules** keep routes, controllers, services, repositories, models, validation, and tests together.
- **Service/repository separation** keeps business rules out of persistence code and hides Mongoose details from services.
- **Zod contracts** validate environment variables, request bodies, route params, and query strings.
- **Centralized errors and responses** keep success and failure payloads predictable.
- **Cursor pagination** avoids `skip`-based pagination costs on growing collections.

## Production-minded decisions

- Environment configuration is validated at startup and fails fast when required values are missing.
- The Docker image uses a multi-stage build and runs as a non-root user.
- Security middleware includes Helmet, CORS controls, request rate limiting, auth-route rate limiting, and JWT bearer auth.
- Logs use Pino: pretty in development, JSON in production.
- CI runs formatting/lint checks, TypeScript typecheck, Vitest coverage, and Docker image build.

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

## API Endpoints

### Auth flow and protected product routes

The **`auth`** feature is a minimal **register + login** flow: both endpoints return a **JWT**. The **`product`** example uses that token as **Bearer** auth on writes only: **create, update, and delete** require `Authorization: Bearer <jwt>`; **list** and **get by id** stay open (no token).

### Root

- `GET /` — `{ "status": "running" }`

### Health

- `GET /v1/health` — uptime-style payload

### Auth

- `POST /v1/auth/signup` — register (returns JWT)
- `POST /v1/auth/login` — login (returns JWT)

### Products (reference module)

The product feature is intentionally small: it exists as a reference module for validation, auth-protected writes, service/repository/model separation, cursor pagination, simple filters, and feature-level tests. Products include `price`, `stock`, `status` (`draft`, `active`, `archived`), and `isFeatured`.

- `GET /v1/products` — list (`cursor`, `limit`, `status`, `isFeatured` query params); public
- `GET /v1/products/:id` — get by id; public
- `POST /v1/products` — create; **JWT required**
- `PUT /v1/products/:id` — update; **JWT required**
- `DELETE /v1/products/:id` — delete; **JWT required**

Active products must be archived before deletion. This keeps the example domain small while still showing where service-level business rules belong.

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

The Compose setup starts the production API image plus a local MongoDB container by default. A `.env` file is optional for Compose; Docker Compose reads it for variable substitution when present, but the compose file also provides safe local defaults. Inside Compose, `COMPOSE_MONGODB_URI` controls the API container database connection and defaults to `mongodb://mongo:27017/api_starter`, because `localhost` inside the API container would point to the API container itself, not MongoDB.

Compose uses `JWT_SECRET` when provided, otherwise it falls back to a demo-only secret long enough to satisfy startup validation. Replace it for real environments.

To use MongoDB Atlas or another remote MongoDB with Compose, set only `COMPOSE_MONGODB_URI` in your `.env`; no change to `docker-compose.yml` is required.

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

Use `src/api/product/` as the intentionally small reference module for CRUD routes, Zod validation, auth middleware, service/repository/model separation, cursor pagination, filtering, simple service-level rules, and feature-level tests.

Architecture decisions, layer responsibilities, and coding conventions are documented in [ARCHITECTURE.md](./ARCHITECTURE.md), including the full project structure and layer flow.

### AI-assisted development

This project includes configuration files for AI coding assistants:

| Tool         | File                                 |
| ------------ | ------------------------------------ |
| Claude Code  | [`CLAUDE.md`](./CLAUDE.md)           |
| OpenAI Codex | [`AGENTS.md`](./AGENTS.md)           |
| Cursor       | [`.cursor/rules/`](./.cursor/rules/) |

Each file points to `ARCHITECTURE.md` as the source of truth so any AI assistant follows the same conventions when generating or modifying code.

## Testing

The test setup uses **Vitest** with explicit imports, **Supertest** for HTTP behavior, and mocked Mongoose models so CI does not require a live database.

```bash
npm run typecheck
npm test
npm run test:coverage
```

Husky runs `npm run validate` automatically on each commit to keep lint and formatting clean.

## Trade-offs

This is a starter, not a full product. The `product` module is intentionally small but not empty: it demonstrates validation, auth-protected writes, repository-backed persistence, cursor pagination, filters, defaults, and one service-level rule (`active` products must be archived before deletion). Business-heavy modules such as payments, orders, subscriptions, or multi-tenant workflows belong in downstream applications built from this starter.

## License

MIT.
