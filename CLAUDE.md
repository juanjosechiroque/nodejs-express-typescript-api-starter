# CLAUDE.md

Architecture, patterns, and conventions are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md). Read it before making any changes.

## Commands

```bash
npm run dev           # development server
npm test              # Vitest + Supertest
npm run test:coverage # Vitest coverage report
npm run validate      # ESLint + Prettier check
npm run typecheck     # TypeScript typecheck
npm run build         # compile TypeScript to dist/
npm run format        # auto-fix
```

## Before committing

```bash
npm run validate && npm run typecheck && npm run build && npm test
```

All checks must pass. Fix any failures before committing — do not skip hooks.
