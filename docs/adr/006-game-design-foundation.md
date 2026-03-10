# ADR 006 — Game Design Foundation

## Status
Accepted

## Context
A clear, committed game design document is needed before any system is built. Without it, systems get built for the wrong design and must be refactored.

## Decision
The game design is captured in `CLAUDE.md` (the authoritative project briefing) and this ADR.

Core design pillars:
- **No forced story ending** — empire building is the point
- **Dynasty across runs** — up to 4 leaders, 75–100 year guild lifespan
- **Adventurer legacy tiers** — F through Legendary, with prestige eligibility from C up
- **Prestige trigger** — a Legendary adventurer retires to found their own guild; their career becomes the next leader's hero class
- **World awareness** — scales with prestige count; dynasty is invisible to the world for the first two prestiges
- **Conclave** — every 5 in-game years, measures dynasty growth; resets Skill Borrow

Deferred design decisions (do not implement until closed):
- Branch merging conditions
- Hero ability system scope (Option 3)
- NPC guild minimum tenure numbers
- Economy gold rates and costs

## Consequences
**Positive:**
- All engineers work toward the same game design
- Deferred decisions are clearly marked — no premature implementation

**Negative:**
- The design may evolve; this ADR must be updated when it does
