# ADR 010 — Feature Gating and Entitlements Architecture

## Status
Accepted

## Context
Some game features unlock progressively (Conclave, Skill Borrow, Master Mentor, world awareness tiers). These gates must be enforced consistently and testably without scattering conditional logic across all systems.

## Decision
Feature gates are determined from game state. Gate checks:
- Live in a dedicated utility module (not scattered across systems)
- Are pure functions — same inputs always produce the same output
- Reference constants from `balance.ts` (no magic numbers in gate logic)

### Gate signatures — updated 2026-03-17

Gates that depend only on the active run use `(GameState) => boolean`.

Gates that depend on cross-run progression (prestige count, world awareness
tier) use `(GameState, DynastyState | null) => boolean`. Dynasty is a
separate Zustand slice (per ADR-003) — mirroring dynasty values into
GameState would create two sources of truth, which is an anti-pattern.
Gates declare their dependencies explicitly in their signature instead.

```ts
// Active-run gate — no dynasty needed
hasMagicRewindSafety(state: GameState): boolean

// Cross-run gate — needs dynasty
isMasterMentorUnlocked(state: GameState, dynasty: DynastyState | null): boolean
isSkillBorrowAvailable(state: GameState, dynasty: DynastyState | null): boolean
```

When `dynasty` is null (first run, or dynasty not yet loaded), cross-run
gates return `false` — features remain locked until dynasty is available.

No monetization entitlements exist at launch. This ADR covers **progression gates only**.

## Consequences
**Positive:**
- Gate logic is centralized, testable, and easy to audit
- Balance changes only require updating `balance.ts`
- No scattered `if prestige >= 10` checks throughout the codebase
- No data mirroring — one source of truth for each value
- Gate dependencies are explicit and visible in the function signature

**Negative:**
- Gate utility module must be kept up to date as new gates are added
- Cross-run gates require dynasty to be threaded to the call site
