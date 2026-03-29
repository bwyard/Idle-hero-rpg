# State Architecture

## Overview

Game state is split across two Zustand stores and loaded in three layers. Static template data is never stored in the save file.

See ADR-003 for the storage decision record.

---

## Two Stores

### `gameStore` — Persisted
- File: `apps/game/src/stores/gameStore.ts`
- Holds: `GameState` (the full save file)
- Persisted via MMKV
- Exposes: `tick()`, `dispatch(action)`, `loadActiveRun()`, `loadDynastyLayer()`

### `uiStore` — Not Persisted
- File: `apps/game/src/stores/uiStore.ts`
- Holds: active view, modal state, selected adventurer ID, etc.
- Intentionally resets on every app launch

---

## Three-Layer Loading

| Layer | What | When | How |
|---|---|---|---|
| Active run | Current run's `GameState` | Immediately on launch | Synchronous MMKV read |
| Dynasty layer | Meta-progression across runs | After first render (deferred) | `loadDynastyLayer()` in `useEffect` |
| History layer | NPC guild history, previous runs | On demand | Loaded when player navigates to history views |

Migrations run before any layer is handed to the engine.

---

## GameState Shape

Defined in `packages/shared/src/types/gameState.ts`.

Key rules:
- Every `GameState` carries a `version` field — incremented with every migration
- All collections are `Record<string, T>` keyed by ID — never arrays for things you look up
- Static data (hero class definitions, building templates, quest templates) is referenced by ID only — not embedded in the save file
- `eventLog` is the causal history of the game — events carry `causeId` for causal linking (ADR-012)

```
GameState
├── version: number
├── rngSeed: number
├── time: { ticksElapsed, currentDay, currentSeason, currentYear }
├── hero: Hero
├── guild: Guild
├── adventurers: Record<string, Adventurer>
├── transientVisitors: Record<string, TransientVisitor>
├── cities: Record<string, City>
├── buildings: Record<string, Building>
├── quests: Record<string, Quest>
├── dynasty: Dynasty
├── rivals: Record<string, Rival>
├── eventLog: ReadonlyArray<GameEvent>    ← causal history (source of truth, Phase 4+)
├── pendingEvents: ReadonlyArray<GameEvent>
└── flags: { prestigeAvailable }
```

---

## Static vs Dynamic Data

| Type | Example | Lives in |
|---|---|---|
| Dynamic (save file) | An adventurer's current tier, XP, name | `GameState` |
| Static (template) | What abilities a Warblade class has | `packages/shared` types + future template registry |

Static templates are queried by ID at runtime. They are never serialised into the save file.

---

## Migrations

- Every `GameState` has a `version: number` field
- On load, migrations run in version order before any system touches the state
- Migration logic lives in `apps/game/src/stores/migrations.ts`
- Adding a field with a default value = bump the version, add a migration

---

## Temporal Architecture Direction (ADR-012)

The event log is transitioning from informational to source of truth:

| Phase | Role of `eventLog` | Role of materialised state |
|---|---|---|
| Phases 0–3 (current) | Informational log | Ground truth |
| Phase 4 (prestige/hero) | Source of truth for new systems | Ground truth for legacy systems |
| Phase 5+ | Source of truth | Materialised cache/projection |

Every `GameEvent` now carries a `causeId` field linking to its causal parent.
New systems (prestige, dynasty, hero identity) derive state from the event
chain. Existing systems migrate incrementally.

Full reference: `docs/architecture/temporal.md`
