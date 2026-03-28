# Engine Architecture

## Overview

The game engine is a pure functional pipeline. It has no knowledge of React, no side effects, and no mutations. The UI is a swappable layer on top.

See ADR-001 for the decision record.

---

## Core Files

| File | Purpose |
|---|---|
| `apps/game/src/engine/pipe.ts` | Utility: compose a series of `(T) => T` transformations |
| `apps/game/src/engine/tick.ts` | Advance game state by one tick — calls all 12 systems in order |
| `apps/game/src/engine/dispatch.ts` | Apply a player action to game state |

---

## Tick Pipeline

`tick(state: GameState): GameState`

Each system is a pure function: `(GameState) => GameState`. They are composed via `pipe` in this exact order:

| # | System | File |
|---|---|---|
| 1 | `advanceTime` | `systems/advanceTime.ts` |
| 2 | `processEconomy` | `systems/processEconomy.ts` |
| 3 | `processAdventurers` | `systems/processAdventurers.ts` |
| 4 | `processQuests` | `systems/processQuests.ts` |
| 5 | `processBuildings` | `systems/processBuildings.ts` |
| 6 | `processHero` | `systems/processHero.ts` |
| 7 | `processRivals` | `systems/processRivals.ts` |
| 8 | `processConclave` | `systems/processConclave.ts` |
| 9 | `checkPrestigeConditions` | `systems/checkPrestigeConditions.ts` |
| 10 | `checkLeaderPressure` | `systems/checkLeaderPressure.ts` |
| 11 | `checkForcedPrestige` | `systems/checkForcedPrestige.ts` |
| 12 | `processEventLog` | `systems/processEventLog.ts` |

**Order is load-bearing.** Systems later in the pipe read state written by earlier systems. Do not reorder without an ADR.

---

## Dispatch

`dispatch(state: GameState, action: GameAction): GameState`

All player-initiated state changes go through `dispatch`. The `GameAction` type is a discriminated union — each case maps to a handler. Actions are defined in `packages/shared/src/types/actions.ts`.

---

## Rules (non-negotiable)

- No mutations. Always spread or return new objects.
- No side effects. No I/O, no logging, no React, no storage.
- All numeric constants come from `apps/game/src/data/balance.ts`. No magic numbers in system files.
- Systems that need to emit events append to `state.pendingEvents`. `processEventLog` (system 13) commits them to `state.eventLog`.
- Every event carries a `causeId` linking to its causal parent (or `null` for root events). See ADR-012.

---

## Testing

Property-based tests cover the tick invariants:
- `ticksElapsed` always increments by exactly 1
- Input state is never mutated
- Same input always produces the same output

See `apps/game/src/engine/__tests__/tick.property.test.ts`.

---

## Temporal Architecture

The engine follows the Temporal Architecture (ADR-012). The four primitives:

| Primitive | How it applies |
|---|---|
| **Time** | Game tick is the temporal coordinate. Never wall clock. |
| **Causality** | Every `GameEvent` carries a `causeId` linking to its parent event. |
| **Information** | Systems share events via the event log, not mutable objects. |
| **Context** | Multiple projections (player view, achievements, prestige) over the same log. |

New systems (Phase 4+) are built event-sourced from day one. Existing systems
migrate incrementally. Full reference: `docs/architecture/temporal.md`.
