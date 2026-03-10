# ADR 004 — Vitest + fast-check Property Testing

## Status
Accepted

## Context
The pure functional engine is the heart of the game. It must be thoroughly tested. Traditional example-based tests can miss edge cases in state transitions (e.g., overflow at large tick counts, unexpected interactions between systems).

## Decision
Use **Vitest** as the test runner for all unit and property tests.

Use **fast-check** for property-based testing of:
- The `tick` function (invariants across all valid GameState inputs)
- The `dispatch` function (action application invariants)
- Individual system processors

Property tests live alongside unit tests in `__tests__/` folders, named `*.property.test.ts`.

## Consequences
**Positive:**
- Property tests catch edge cases that example tests miss
- Vitest is fast and has first-class TypeScript support
- fast-check shrinks failing cases automatically for easy debugging
- Both run in Node — no React Native runtime needed for engine tests

**Negative:**
- Property tests are slower than unit tests (must run many examples)
- Engineers must think in terms of invariants, not just examples
