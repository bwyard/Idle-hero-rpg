# Retired Hero's Guild

A mobile idle clicker tycoon built with React Native and Expo. You are a retired legendary adventurer founding a guild dynasty across a Fiore-scale kingdom.

## Platform

- **Primary**: Android
- **Future**: iOS
- **E2E testing only**: Expo Web

## Project Structure

```
/
├── apps/
│   └── game/           # React Native / Expo app
├── packages/
│   ├── shared/         # TypeScript types (barrel exports by domain)
│   └── mcp/            # MCP development server
├── e2e/                # Cypress E2E (Expo Web target)
├── docs/adr/           # Architecture Decision Records
├── turbo.json
└── CLAUDE.md           # Authoritative project briefing
```

## Getting Started

```bash
npm install
```

**Run the game (Android):**
```bash
npm run dev --workspace=apps/game
```

**Run unit + property tests:**
```bash
npm run test:unit
```

**Run lint and typecheck:**
```bash
npm run lint && npm run typecheck
```

## Architecture

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture reference.

Key decisions are documented in [`docs/adr/`](./docs/adr/).

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native, Expo managed workflow with Dev Client |
| Navigation | Expo Router |
| State | Zustand (MMKV persistence for game state) |
| Monorepo | Turborepo |
| Unit/Property Tests | Vitest + fast-check |
| E2E | Cypress on Expo Web |
| Types | TypeScript strict |
| Linting | ESLint (strict, `no-any` as error) |
| Formatting | Prettier |
| Commits | Conventional commits (Husky + lint-staged) |
| CI | GitHub Actions |

## Tools and Technologies

This project uses the following tools:
- [Expo](https://expo.dev/)
- [Turborepo](https://turbo.build/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Vitest](https://vitest.dev/)
- [fast-check](https://fast-check.io/)
- [Cypress](https://www.cypress.io/)
- [Claude Code](https://claude.ai/code) — AI coding assistant

## Contributing

Branch from `develop`. PRs target `develop`. See `CLAUDE.md` for the full git workflow and commit conventions.
