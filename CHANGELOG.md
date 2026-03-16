# idle-hero-rpg — Changelog

## 2026-03-16 (all commits)

### Features

- quest completion events + progressive disclosure utility (fdca27c)
- add MMKV persistence adapter, state migration runner, and gameStore wiring (874fefb)
- implement checkPrestigeConditions with TDD (212cbcc)
- implement 365-day calendar with variable seasons and day/season time model (d3007ec)
- add VisitorCard UI and wire visitors into demo dashboard (9258cb0)
- wire processTransientVisitors into tick pipe as system 6 (95d250b)
- implement transient visitor system with TDD (1d9756f)
- add QuestBoard UI, AdventurerPicker modal, and wire into dashboard (a70f451)
- wire GENERATE_QUESTS and update START_QUEST to assign existing quests (61b5206)
- add quest generation system with TDD tests (e00de78)
- add adventurer detail page with tappable roster navigation (a14d498)
- retheme demo UI for accessibility, add missing deps, upgrade vitest (1fb9604)
- add live demo dashboard wiring Zustand gameStore to UI (b9be104)
- implement dispatch action handlers and populate initial state (a3c89bb)
- replace stub impls with placeholder impls across all systems (23cf6a7)
- implement advanceTime tick-to-year conversion (ea684bb)
- implement processEventLog system (82abf60)
- implement state migration runner (8066268)
- implement processEventLog system (1c3e25e)
- add codebase intelligence MCP server (00bcfe6)
- interface-first pattern for systems with pending design decisions (fb8db30)
- transient visitor types, ID strategy docs, dorm system TODOs (47df305)
- implement MCP server tools with tests and TODO.md (3947f52)

### Bug Fixes

- resolve lint conflicts and add eslint to pre-commit (5008efd)
- resolve TypeScript error in HeroCard AP bar width type (6f64b84)
- add non-null assertions to processEventLog test array access (8f0c853)
- use double cast for GameState to Record in migration tests (7a4d7f7)
- add non-null assertions to processEventLog test array access (36824e9)
- resolve lint errors in codebase-mcp (12bc650)
- resolve all lint CI failures across monorepo (6d2a8cc)
- resolve all lint CI failures across monorepo (6d695d9)
- resolve all lint CI failures across monorepo (2e1b4f5)

### Refactoring

- adopt parseJsonResponse helper in game MCP tests (a89b267)
- add parseJsonResponse test helper for typed JSON.parse (2239f42)

### Tests

- add integration tests for full 13-system tick pipeline (1e5676b)
- add dispatch and initialState tests, fix react version (125e75a)

### Documentation

- update CLAUDE.md with TDD enforcement, current status, pre-push checklist (f2ad92c)
- correct PR count — process-update branch has no PR yet (3a0278e)
- update session tracking with lint CI fix details (af15466)
- update session tracking for next session handoff (a73313e)
- add three-column timeline — no AI / with AI / actual (f76972a)
- add full development roadmap — Phase 0 through Google Play (1814033)
- clarify template registry is shape fixture; add Big O TODOs (d127c98)
- add ADR 011 — accessibility architecture (be44109)
- clarify Shadow and Paladin as possible future hero classes (276cdef)
- lock prestige system design — full trigger conditions recovered (720f1e1)
- build pointer file targets from decisions.md (3c5b0c4)
- reformat decisions.md as proper markdown (df741bb)
- add decisions and session tracking document (87345dc)

### Chores

- fix husky hooks and add lint-staged config (b84bae5)
- wire MCP servers into Claude Code config (ca8e6ba)
- close ID strategy decision and add tick pacing constants (9cd2dd4)
- add .turbo/ to .gitignore (ef565a7)
- fix turbo test task warning; note Vite CJS deprecation (5804739)
- add package-lock.json (f7d8667)
- set up full monorepo project structure (5b7e43e)
