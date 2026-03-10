# ADR 010 — Feature Gating and Entitlements Architecture

## Status
Accepted

## Context
Some game features unlock progressively (Conclave, Skill Borrow, Master Mentor, world awareness tiers). These gates must be enforced consistently and testably without scattering conditional logic across all systems.

## Decision
Feature gates are determined **from GameState** — specifically from `dynasty.prestigeCount` and other state values.

Gate checks:
- Live in a dedicated utility module (not scattered across systems)
- Are pure functions: `(GameState) => boolean`
- Reference constants from `balance.ts` (no magic numbers in gate logic)

Examples:
- `isMasterMentorUnlocked(state)` — checks `state.dynasty.prestigeCount >= MASTER_MENTOR_UNLOCK_PRESTIGE`
- `hasMagicRewindSafety(state)` — checks prestige count against `MAGIC_REWIND_SAFETY_MAX_PRESTIGE`

No monetization entitlements exist at launch. This ADR covers **progression gates only**.

## Consequences
**Positive:**
- Gate logic is centralized, testable, and easy to audit
- Balance changes only require updating `balance.ts`
- No scattered `if prestige >= 10` checks throughout the codebase

**Negative:**
- Gate utility module must be kept up to date as new gates are added
