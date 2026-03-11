# Current Sprint

## Sprint: Phase 1 — Core Loop MVP
**Status:** Starting
**Started:** 2026-03-11
**Previous sprint:** Project Foundation (complete — see session log in decisions.md)

---

## Goal

Make the game tick visibly. A player launches the app, sees a guild screen, watches
the year counter advance, and sees gold change. No recruitment, no quests.
Just a live ticking game state rendered on screen with save/load working.

---

## Where We Are Right Now

Foundation sprint complete. 72 tests passing, 4 typechecks clean.

| Layer | Status |
|---|---|
| Monorepo + tooling | Complete |
| Shared types | Complete |
| Pure engine (pipe, dispatch, tick) | Complete |
| All 12 system stubs | Stubbed — interface-first pattern applied to 6 systems |
| System contracts (interface-first) | Complete — 6 interfaces, 6 stubs, contract tests live |
| Zustand stores | Shape defined, not wired to MMKV |
| MMKV persistence | Not wired |
| State migrations | Not implemented |
| MCP server (4 tools) | Complete — 30 tests |
| CI (lint, typecheck, unit, property) | Complete |
| Screens | None |

**Branch status — none of this work has reached `develop` yet.**
3 open PRs, all failing CI lint. `claude/process-update-PhKCs` (this branch) has no PR yet.

| Branch | PR | Lint |
|---|---|---|
| `claude/setup-project-structure-PhKCs` | Open | Needs cherry-pick of `2e1b4f5` |
| `claude/mcp-server-tools-PhKCs` | Open | Needs cherry-pick of `2e1b4f5` |
| `claude/interface-first-pattern-PhKCs` | Open | Needs cherry-pick of `2e1b4f5` |
| `claude/process-update-PhKCs` | **No PR yet** | Clean — contains the lint fix |

**First task of next session:**
1. Cherry-pick `2e1b4f5` into the 3 other branches and push
2. Open a PR for `claude/process-update-PhKCs`
3. Confirm CI green on all 4 PRs before merging anything

---

## Phase 1 Deliverables

### Only Real Blocker
- [ ] **Close ID strategy decision** → `createId(prefix)` factory in
  `packages/shared/src/utils/id.ts`. Gates any system that creates a live game
  object. See TODO.md P1 for full option analysis (prefixed nanoid is preferred).

### Core Engine
- [ ] `processEventLog` — collect `pendingEvents`, append to `eventLog`, trim to
  max length, clear pending
- [ ] `advanceTime` tick→year conversion — real formula, replace stub
- [ ] Wire MMKV to Zustand `loadActiveRun` — active run loads on launch
- [ ] State migration runner — load version, run migrations in sequence

### First Screen
- [ ] Navigation shell (Expo Router entry point)
- [ ] Guild overview screen — name, year, gold, adventurer count, tick timer

### Tests
- [ ] Integration tests for full tick pipeline (all 12 systems piped)
- [ ] `fast-check` property tests: arbitrary `GameState` in, shape invariants out

### Git Workflow
- [ ] Cherry-pick lint fix (`2e1b4f5` from `claude/process-update-PhKCs`) into 3 other branches
- [ ] Confirm CI green on all 4 PRs
- [ ] Merge `claude/process-update-PhKCs` into `develop`
- [ ] Merge `claude/setup-project-structure-PhKCs` into `develop`
- [ ] Merge `claude/mcp-server-tools-PhKCs` into `develop`
- [ ] Merge `claude/interface-first-pattern-PhKCs` into `develop`

---

## Not Blockers This Sprint

These are deferred by design — interface-first pattern handles them:

| Item | Why not a blocker |
|---|---|
| Economy design pass (rates, costs) | `EconomyImpl` interface live, stub running |
| Adventurer XP/tier tuning | `AdventurerProgressionImpl` stub running |
| Building income rates | `BuildingProductionImpl` stub running |
| Option 3 (hero ability system scope) | `HeroAbilityImpl` stub running, decision gates Phase 4 |
| NPC guild tenure numbers | `RivalProgressionImpl` stub running |

---

## Key Files for Next Session

| What | Where |
|---|---|
| Architecture rules (non-negotiables) | `CLAUDE.md` |
| All closed decisions + session log | `docs/decisions.md` |
| Full phase plan + timeline | `docs/ROADMAP.md` |
| Prioritised task list | `TODO.md` |
| System interfaces (interface-first) | `packages/shared/src/types/systemImpls.ts` |
| Contract tests | `apps/game/src/__tests__/systemContracts.test.ts` |
| Balance constants | `apps/game/src/data/balance.ts` |
| ADRs | `docs/adr/` |
| Design docs per domain | `docs/design/` |
