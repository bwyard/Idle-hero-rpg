# ADR 002 — Monorepo with Turborepo

## Status
Accepted

## Context
The project has three distinct packages that need to share types:
- `apps/game` — the React Native / Expo app
- `packages/shared` — TypeScript types shared across all packages
- `packages/mcp` — the MCP development server

These packages need a build pipeline that handles inter-package dependencies, caching, and parallel task execution.

## Decision
Use **Turborepo** as the monorepo orchestrator with **npm workspaces**.

- `turbo.json` defines task pipelines (build, lint, typecheck, test)
- `packages/shared` is referenced by path in dependent package.json files
- TypeScript project references handle type resolution without requiring a full build step during development

## Consequences
**Positive:**
- Task output caching speeds up CI significantly
- Parallel task execution where dependencies allow
- Single `npm run test` from root runs all tests across all packages
- Clear separation between app code, shared types, and tooling

**Negative:**
- Turborepo adds a learning curve for contributors unfamiliar with monorepos
- Local `npm link`-style resolution requires path aliases in tsconfig
