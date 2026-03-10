# ADR 009 — Progressive Disclosure on Kingdom View

## Status
Accepted

## Context
The kingdom view shows all adventurers across all locations. At scale, rendering every F/D/C-tier adventurer individually creates visual noise and performance issues.

## Decision
Apply **progressive disclosure** on the kingdom view:

- **F, E, D tier** adventurers collapse to aggregate counts (e.g., "12 F-tier adventurers")
- **C tier and above** show abbreviated detail cards
- **Full detail** is only shown in the city view and roster view

The `KINGDOM_VIEW_COLLAPSED_TIERS` constant in `balance.ts` defines which tiers collapse.

## Consequences
**Positive:**
- Kingdom view remains readable at scale
- Lower-tier adventurers don't dominate the visual hierarchy
- Performance is bounded — the number of rendered elements doesn't grow linearly with roster size

**Negative:**
- Requires two rendering paths for adventurers (collapsed aggregate vs. detailed card)
- Aggregate counts must update in real time as adventurers tier up
