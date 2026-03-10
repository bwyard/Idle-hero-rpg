# Prestige — Design Reference

**Status:** PARTIALLY CLOSED — full trigger conditions lost in session transfer

> ⚠️ Do not implement prestige trigger logic until this document is re-locked.
> See decisions.md open questions — "Prestige trigger conditions full design."

---

## What Is Locked

### Eligibility
- F, E, D tiers — never prestige-eligible
- C through Legendary — prestige-eligible, C is the entry point
- Escalating benefits and archetype options per tier

### Trigger (principle only — conditions not yet re-locked)
- Prestige is triggered when a **Legendary adventurer retires** to found their own guild
- Their adventurer career (class, stats, milestones) converts to the hero class for the next leader
- Run 1 only: starting class selection menu (no prestige conversion exists yet)

### Escalation (prestige 10+)
- After prestige 10, multiple high-tier adventurers must be available simultaneously
- Not just one Legendary — the bar escalates
- Constant: `PRESTIGE_ESCALATION_THRESHOLD` in `balance.ts`

### Forced Prestige Windows
- Early prestiges have forced prestige windows
- Exact conditions lost — needs recovery

### Guild Relationship Tiers
| Prestige Rank | Relationship Created |
|---|---|
| C | Affiliate |
| B | Branch |
| A | Chapter or fresh guild |
| S | HQ |
| SS | Independent Guild |
| Legendary | World event |

### World Awareness
| Prestige Count | Status |
|---|---|
| 1–2 | World unaware of dynasty |
| 3–15 | Scales upward |
| 16+ | Mythic status |

---

## What Is NOT Yet Re-Locked

- Full trigger conditions (what exactly must be true for prestige to become available)
- Forced prestige window timing and conditions
- What "prestige benefits" are at each tier (escalating — but specifics TBD)
- Post-prestige class conversion details (which hero class options unlock at which tier)

---

## Implementation Notes

- `checkPrestigeConditions` (system 9) sets `state.flags.prestigeAvailable`
- `checkForcedPrestige` (system 11) handles forced windows
- Both are **stubs** — do not implement until this document is re-locked
- Constant stubs: `PRESTIGE_ESCALATION_THRESHOLD`, `MYTHIC_STATUS_PRESTIGE` in `balance.ts`
