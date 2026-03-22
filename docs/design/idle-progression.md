# Idle Progression & Autonomy — Design Reference

**Status:** LOCKED — decided 2026-03-22

---

## Philosophy

Idle time autonomy is earned, not given. The guild earns the right to run
itself as the dynasty grows in world standing. This ties mechanical convenience
directly to narrative progression — a WorldFamous guild doesn't need daily
supervision because it has the people and systems in place.

The soft nudge model is the right choice over a hard stop. The world keeps
moving while you're away. Your absence has consequences, not a frozen screen.

---

## Idle Cap by World Awareness Tier

One idle cap per `WorldAwarenessTier`. Cap advances when the tier advances.

| WorldAwarenessTier | Prestige | Idle cap | Natural rhythm |
|--------------------|----------|----------|----------------|
| Hidden             | 0–2      | 7 days   | Active phase — still learning systems |
| Local              | 3–4      | 30 days  | Monthly check-ins |
| Regional           | 5–7      | 1 season (91 days) | Seasonal check-ins |
| Continental        | 8–11     | 1 year (364 days) | Annual review |
| WorldFamous        | 12–15    | 1 Conclave (5 years) | Conclave-driven decisions only |
| Mythic             | 16+      | Uncapped | Legacy runs itself |

Constants: `PLACEHOLDER_IDLE_CAP_DAYS` in `balance.ts` — treat as
placeholder until playtesting validates the values.

---

## What Happens Past the Cap — Consequence Stack

Past the idle cap, consequences accumulate in order. Each stage is a
soft nudge, not a hard stop. The guild keeps ticking.

| Time past cap | Consequence |
|---|---|
| +25% over cap | Quest board stops generating new quests |
| +50% over cap | Morale drops — adventurer XP gains slow |
| +75% over cap | Upkeep continues, active income drops (no management) |
| +100% over cap | Rivals absorb quests, gain standing in regions you hold |
| Crisis point   | Senior adventurer calls a vote of no-confidence |

---

## Crisis Resolution

At the crisis point, the player must choose. Two options only — no defer.

### Option A — Force Prestige

> "Your guild can no longer wait. The torch passes."

The current leader steps down under pressure. Narrative: circumstance, not
failure. The next leader inherits a weakened guild:

- Starting gold reduced by crisis penalty (balance constant)
- Roster morale starts below baseline
- One advisor slot unlocked earlier to compensate (silver lining mechanic)

The story continues. Prestige count increments normally. World awareness
may still advance on schedule.

This feeds into the existing `checkForcedPrestige` system — idle-driven
crisis is another trigger path into the same flow.

### Option B — Stop the Clock

> "The world has been paused. Your guild is frozen in time."

The game explicitly acknowledges the break. The world freezes exactly as
left. No consequence accumulation, no rival gains, no gold changes.

Presented honestly — not hidden, not punished — but framed as clearly
inferior to Option A. Immersion is broken. The player knows it.

Use case: the player genuinely cannot return for an extended real-world
period. The option exists so nothing is permanently damaged.

---

## Implementation Notes

- `WorldAwarenessTier` already exists in `packages/shared/src/types/dynasty.ts`
- Idle cap should be read from `PLACEHOLDER_IDLE_CAP_DAYS[state.dynasty.worldAwarenessTier]`
- Consequence stack triggers are percentage-based over cap — not absolute days
- Crisis → force prestige feeds `checkForcedPrestige` (system 11 in tick pipe)
- "Stop the clock" pauses the tick loop entirely — no tick, no state change
- Do not implement until offline tick system (stage-loop wiring) is ready

---

## What Is Still TBD

- Exact crisis penalty values (starting gold reduction, morale hit)
- Whether the silver lining (early advisor slot) is worth the complexity
- Notification strategy for soft nudges on mobile (push notification vs. in-app)
- Whether Force Prestige at crisis counts toward the forced window timeline
  (prestige 1–6 year caps) or overrides it
