# Current Sprint

## Sprint: Project Foundation
**Status:** In progress
**Started:** 2026-03-10

---

## Goal

Establish the full monorepo scaffold so that every future feature branch has a clean, tested, CI-gated foundation to build on. No game logic ships this sprint — only structure, contracts, and guardrails.

---

## Deliverables

### Done
- [x] Turborepo monorepo with npm workspaces (`apps/game`, `packages/shared`, `packages/mcp`, `e2e`)
- [x] Strict TypeScript config (root + per-package)
- [x] ESLint strict, Prettier, Husky + commitlint, lint-staged
- [x] `CLAUDE.md` — authoritative project briefing
- [x] `docs/decisions.md` — closed decisions, open questions, session log
- [x] All 10 ADRs written (`docs/adr/001` through `010`)
- [x] `apps/game/src/data/balance.ts` — all numeric constants, economy stubs with TODOs
- [x] `packages/shared` — TypeScript types for all domains, barrel exports
- [x] Pure functional engine: `pipe`, `tick`, `dispatch`
- [x] All 12 system stubs in tick-pipe order, each with TODO comments
- [x] Zustand stores: `gameStore` (persisted), `uiStore` (non-persisted), `initialState`
- [x] Vitest + fast-check: unit tests for `pipe` and `advanceTime`, property tests for `tick`
- [x] MCP server with 4 Zod-validated tool stubs
- [x] Cypress E2E config + smoke test (Expo Web target)
- [x] GitHub Actions CI (lint/typecheck/unit on push; E2E gated to PRs targeting main/develop)
- [x] PR template
- [x] `docs/sessions/`, `docs/architecture/`, `docs/design/` pointer files

### Not Started (next sprints)
- [ ] PowerShell profile — git safeguards, session load scripts
- [ ] MCP server wired to live game state (currently stubs)
- [ ] Prestige trigger design (BLOCKED — see decisions.md open questions)
- [ ] Economy design pass (pending dedicated session)
- [ ] First real system implementation (advanceTime is the only non-stub)

---

## Next Sprint Options

Priority order based on decisions.md:

1. **Workflow & tooling sprint** — PowerShell profile, session update scripts, MCP wiring, docs folder conventions
2. **Prestige trigger design session** — recover lost design, lock down, update decisions.md immediately
3. **Economy design pass** — dedicated session to close all economy open questions, then implement as swappable component

---

## Blocked Items

| Item | Blocker |
|---|---|
| Prestige trigger implementation | Full trigger conditions lost in session transfer — needs design redo before any code |
| Economy implementation | Design pass pending — all values are stubs in balance.ts |
