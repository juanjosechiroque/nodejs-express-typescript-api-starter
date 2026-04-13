# New Project Base

A clean, modern **Node.js** project base with **Express**, **MongoDB**, tests, and practical defaults for building a REST API.

## Features

- ⚡ **JavaScript (ESM)** — native modules
- 🚀 **Express 5** — HTTP API and middleware
- 🔐 **JWT** — token-based auth
- 📋 **Joi** — request validation
- 🧪 **Jest** — end-to-end API tests next to each feature (for now)
- 📝 **ESLint & Prettier** — enforced style and static checks
- 🪝 **Husky** — `npm run validate` on pre-commit
- 🔒 **Security** — Helmet, CORS, rate limiting
- 📊 **Health** — monitoring endpoint
- 🔄 **CI** — GitHub Actions runs lint, format check, and tests on `main`

## Quick Start

### Prerequisites

- Node.js 24+
- npm

### Installation

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

## Environment variables

Copy `.env.example` to `.env`. In non-production, variables are loaded with `dotenv` (see `src/config.js`).

| Variable                    | Required | Description                                                                             |
| --------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `PORT`                      | No       | HTTP port (default `3000`).                                                             |
| `NODE_ENV`                  | No       | Typical values: `development`, `production`. Affects env loading.                       |
| `MONGODB_URI`               | **Yes**  | MongoDB connection string. The app exits at startup if missing or empty.                |
| `JWT_SECRET`                | **Yes**  | Secret used to sign JWTs. Must be set in every environment.                             |
| `JWT_EXPIRATION_TIME`       | No       | JWT lifetime (default `1h`).                                                            |
| `RATE_LIMIT_WINDOW_MINUTES` | No       | Length of the sliding window in **minutes** (default `1`).                              |
| `RATE_LIMIT_MAX`            | No       | Max **HTTP requests per IP** allowed inside that window, not a duration (default `60`). |

## Available Scripts

| Script                  | Description             |
| ----------------------- | ----------------------- |
| `npm start`             | Start server            |
| `npm run dev`           | Start dev server        |
| `npm run validate`      | ESLint + Prettier check |
| `npm run format`        | Format + ESLint --fix   |
| `npm test`              | Jest                    |
| `npm run test:coverage` | Jest + coverage         |

## Project Structure

```text
src/
├── app.js
├── router.js
├── config.js
├── database.js
├── middleware/
├── utils/
├── api/
│   ├── auth/
│   ├── health/
│   ├── product/
│   └── user/
└── tests/
```

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

### Products (example CRUD)

- `GET /v1/products` — list (`page`, `limit` query params); public
- `GET /v1/products/:id` — get by id; public
- `POST /v1/products` — create; **JWT required**
- `PUT /v1/products/:id` — update; **JWT required**
- `DELETE /v1/products/:id` — delete; **JWT required**

## Development

### Adding new features

Add a folder `src/api/<feature>/` and wire it in `src/router.js`. Use `asyncHandler` on async handlers.

Typical files (add only what you need):

- **`{feature}.router.js`** — paths and middleware for that domain.
- **`{feature}.validation.js`** — Joi schemas for inputs.
- **`{feature}.controller.js`** — reads the request, calls the service, sends the response.
- **`{feature}.service.js`** — business logic and rules.
- **`{feature}.dao.js`** — database access for that domain.
- **`{feature}.model.js`** — Mongoose schema when this feature owns persistence.
- **`{feature}.test.js`** — optional; when present, put end-to-end API tests for that module here (for now this is the only style used in the repo).

Use `src/api/product/` when you need a full HTTP module to copy from.

Husky runs `npm run validate` on each commit. Override once with `git commit --no-verify` if you must.

## Testing

```bash
npm test
npm run test:coverage
```

## License

MIT — see [LICENSE](LICENSE).
