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

```
GameState
├── version: number
├── time: { ticksElapsed }
├── hero: Hero
├── guild: Guild
├── adventurers: Record<string, Adventurer>
├── cities: Record<string, City>
├── buildings: Record<string, Building>
├── quests: Record<string, Quest>
├── dynasty: Dynasty
├── rivals: Record<string, unknown>   ← typed when Rivals system is built
├── eventLog: ReadonlyArray<GameEvent>
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
- Migration logic will live in `apps/game/src/stores/migrations.ts` (not yet created)
- Adding a field with a default value = bump the version, add a migration
