# ADR 001 — Pure Functions Architecture

## Status
Accepted

## Context
The game engine needs a deterministic, testable tick loop. Side effects inside the engine (network calls, storage writes, random number seeding from external sources) make the engine hard to test and reason about.

React Native re-renders and Zustand store updates must not bleed into engine logic.

## Decision
The `tick` and `dispatch` functions are **pure functions**:
- No mutations of input state
- No side effects (no I/O, no React, no storage, no logging)
- They take a `GameState`, return a new `GameState`

The `pipe` utility chains system transformations. Each system processor is also a pure function: `(GameState) => GameState`.

UI is a swappable layer over the engine. The engine has **no knowledge of React**.

### Phase 4 extension — dynasty parameter (2026-03-17)
With the introduction of the dynasty layer (separate Zustand slice, loaded
deferred per ADR-003), some systems need cross-run context to do their work:
`processTransientVisitors`, `processRivals`, `processConclave`.

The tick function signature is extended to accept dynasty as an optional
second parameter:

```ts
tick(state: GameState, dynasty: DynastyState | null): GameState
```

Systems that need dynasty declare it explicitly in their signature:
```ts
processTransientVisitors(state: GameState, dynasty: DynastyState | null): GameState
```

Systems that do not need dynasty remain `(GameState) => GameState` — no change.

This follows the dependency injection pattern: dependencies are passed in,
not imported or accessed via global state. The functions remain pure — same
inputs always produce the same outputs. Dynasty-null is a valid input;
systems degrade gracefully (visitor tier falls back to tier-blind generation,
rivals do not appear, conclave skips dynasty scoring).

## Consequences
**Positive:**
- Engine logic is trivially unit-testable and property-testable with fast-check
- State transitions are reproducible and debuggable
- The engine can be run in any JavaScript environment (Node, browser, test runner)
- Dynasty parameter is explicit — no hidden dependencies, no data mirroring between stores

**Negative:**
- Side effects (saving, logging, analytics) must be handled in the store layer, not in systems
- Requires discipline — engineers must not introduce side effects into system files
- Systems that receive dynasty must handle the null case explicitly
