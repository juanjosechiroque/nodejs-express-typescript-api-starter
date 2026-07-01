# AGENTS.md

Architecture, patterns, and conventions are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md). Read it before making any changes.

## Commands

```bash
npm run dev           # development server
npm test              # Jest + Supertest
npm run validate      # ESLint + Prettier check
npm run format        # auto-fix
```

## Before committing

```bash
npm run validate && npm test
```

Both must pass. Fix any failures before committing.
