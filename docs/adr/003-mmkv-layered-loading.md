# ADR 003 — MMKV Storage with Layered Loading

## Status
Accepted

## Context
The game state has three layers with different loading urgency:
1. **Active run** — needed immediately on app launch (blocking)
2. **Dynasty layer** — meta-progression across runs, needed after first render
3. **History layer** — NPC guild history, previous runs — loaded on demand only

The storage layer must be fast (no async overhead for the active run) and support large state objects.

## Decision
Use **react-native-mmkv** for all game state persistence.

Three-layer loading strategy:
- **Active run**: Load synchronously in the Zustand store initializer (MMKV supports synchronous reads)
- **Dynasty layer**: Load in a `useEffect` after first render, stored in the same Zustand store
- **History layer**: Load on demand when the player accesses dynasty history views

State versioning with migrations runs before any state is handed to systems.

## Consequences
**Positive:**
- MMKV is the fastest available storage on React Native (C++ under the hood)
- Synchronous reads avoid async startup complexity for the active run
- Layered loading prevents slow startup from large save files

**Negative:**
- MMKV requires native module — adds to the Expo Dev Client build
- Migrations must be maintained carefully to avoid data loss on upgrades
