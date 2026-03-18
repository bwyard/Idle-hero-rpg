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
- ~~Hero ability system scope (Option 3)~~ — **CLOSED 2026-03-17** (see below)
- NPC guild minimum tenure numbers
- Economy gold rates and costs

### Option 3 — Hero ability system — CLOSED 2026-03-17

**Decision: HYBRID — per-hero class abilities + guild legacy skills.**

Each hero has:
- A **passive ability** tied to their class (always active, every tick)
- A **career milestone active ability** unlocked mid-run (costs Action Points)

The guild accumulates **legacy skills** from retired heroes — 1–4 carry-over
skills per prestige, count scales with guild level and mentoring. Legacy skills
persist across runs in the dynasty layer and are available to all future leaders.

Hero class abilities are data-driven (template registry pattern) — new classes
and abilities are added to static data without touching engine code.

Action Points (AP) regenerate per in-game day. Base rate is set by hero class;
bonus AP scales with guild growth (adventurer count, active visitors, affiliate
guilds, buildings). AP is unused in Phase 4's initial implementation — the
system is built forward-looking with placeholder rates in `balance.ts`.

Legacy skill IDs are free-form strings (`LegacySkillId = string`) keyed into a
static template registry — consistent with the quest and building template
patterns already in the codebase.

## Consequences
**Positive:**
- All engineers work toward the same game design
- Deferred decisions are clearly marked — no premature implementation

**Negative:**
- The design may evolve; this ADR must be updated when it does
