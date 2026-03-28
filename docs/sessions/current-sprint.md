# Current Sprint

## Sprint: Phase 4 — Prestige & Hero System
**Status:** Not started
**Started:** TBD
**Previous sprints:** Phase 0–3 complete (see ROADMAP.md and decisions.md)

---

## Goal

A full run can complete. The prestige trigger fires, a new hero is created, and
the dynasty grows. Portfolio milestone reached.

---

## Where We Are Right Now

Phases 0–3 complete. 264 tests passing across 27 test files.
Temporal Architecture adopted (ADR-012) — `GameEvent.causeId` field added.

| Layer | Status |
|---|---|
| Monorepo + tooling | Complete |
| Shared types | Complete |
| Pure engine (pipe, dispatch, tick) | Complete |
| 13-system tick pipe | Complete (all systems wired) |
| advanceTime | Done (365-day calendar, 4 seasons) |
| processEventLog | Done |
| Zustand stores | Complete, wired to MMKV |
| MMKV persistence | Wired |
| State migrations | Done |
| MCP server (4 tools) | Complete — 20 tests |
| CI (lint, typecheck, unit, property) | Complete |
| Demo dashboard | Complete (8+ components) |
| Quest board | Complete (10 templates, generation, assignment) |
| Transient visitors | Complete (arrive/hold/engage/dismiss) |
| Adventurer detail | Complete (roster, tiers, XP bars) |
| Buildings & economy | Complete (build, upgrade, expand city) |
| Temporal Architecture | ADR-012 adopted, `causeId` on all events |
| All branches merged | Done |

---

## Phase 4 Deliverables

### Open design question (must close first)
- [ ] **ADR-006 Option 3**: shared vs per-leader hero ability system

### Temporal Architecture (ADR-012) — event-sourced from day one
- [x] `GameEvent.causeId` field added for causal linking
- [x] ADR-012 written and accepted
- [x] `docs/architecture/temporal.md` — local temporal architecture reference
- [ ] Prestige as causal branch — `PRESTIGE` event preserves pre-prestige history
- [ ] Hero identity as causal chain — hero state derived from event projections
- [ ] Dynasty meta-progression derived from cross-run event history
- [ ] Typed event discriminated unions for prestige/hero/dynasty events

### Core
- [ ] `processHero` — passive ability effects, action point regen, career milestone tracking
- [ ] Hero class ability system (passive + career milestone active per class)
- [ ] `checkForcedPrestige` — forced window detection, Year 25/30/35/40/45 for prestiges 1–6
- [ ] `checkLeaderPressure` — involuntary leader replacement rules by prestige tier
- [ ] Full prestige flow — Legendary retires, career converts to hero class options, player selects next leader
- [ ] Run 1 class selection menu (no prior career to convert)
- [ ] Dynasty layer wiring — `loadDynastyLayer` deferred load after first render
- [ ] State version + migration for dynasty data
- [ ] Wire MMKV dynasty layer to Zustand

### UI
- [ ] Prestige flow UI — retire screen, career summary, class selection
- [ ] Hero overview screen — current hero, passive ability, action points, career milestone progress
- [ ] Conclave screen — dynasty growth summary, Skill Borrow reset indicator

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
