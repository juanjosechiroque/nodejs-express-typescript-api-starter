# AGENTS.md

Read [ARCHITECTURE.md](./ARCHITECTURE.md) before making changes. It defines the project structure, boundaries, and conventions.

Before committing, run the relevant checks: `npm run validate`, `npm run typecheck`, `npm run build`, and `npm test`.

Update `openapi.yaml` when changing routes, validation schemas, or response shapes.

When changing environment variables, keep `src/config.ts`, `.env.example`, and affected Docker Compose or README instructions in sync.
