# Express Mongo API Starter

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

## Requirements

- Node.js 24+
- npm

## Quick Start

1. **Clone the repository**

    ```bash
    git clone <your-repo-url>
    cd nodejs-express-api-boilerplate
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

The product feature is intentionally small: it exists as a reference module for validation, auth-protected writes, service/DAO/model separation, cursor pagination, simple filters, and feature-level tests. Products include `price`, `stock`, `status` (`draft`, `active`, `archived`), and `isFeatured`.

- `GET /v1/products` — list (`cursor`, `limit`, `status`, `isFeatured` query params); public
- `GET /v1/products/:id` — get by id; public
- `POST /v1/products` — create; **JWT required**
- `PUT /v1/products/:id` — update; **JWT required**
- `DELETE /v1/products/:id` — delete; **JWT required**

Active products must be archived before deletion. This keeps the example domain small while still showing where service-level business rules belong.

## Docker

```bash
docker build -t nodejs-express-api-boilerplate .
docker run -p 3000:3000 --env-file .env nodejs-express-api-boilerplate
```

The image uses a multi-stage build and runs as a non-root user in production.

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

Use `src/api/product/` as the intentionally small reference module for CRUD routes, Zod validation, auth middleware, service/DAO/model separation, cursor pagination, filtering, simple service-level rules, and feature-level tests.

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

```bash
npm run typecheck
npm test
npm run test:coverage
```

Husky runs `npm run validate` automatically on each commit to keep lint and formatting clean.

## License

MIT.
