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

## Consequences
**Positive:**
- Engine logic is trivially unit-testable and property-testable with fast-check
- State transitions are reproducible and debuggable
- The engine can be run in any JavaScript environment (Node, browser, test runner)

**Negative:**
- Side effects (saving, logging, analytics) must be handled in the store layer, not in systems
- Requires discipline — engineers must not introduce side effects into system files
