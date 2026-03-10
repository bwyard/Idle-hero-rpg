# Adventurer Tiers — Design Reference

**Status:** Partially closed (see decisions.md — Prestige — Partial)

---

## Tier Ladder

```
F → E → D → C → B → A → S → SS → Legendary
```

| Tier | Prestige-Eligible | Notes |
|---|---|---|
| F | No | |
| E | No | |
| D | No | |
| C | Yes | Entry point for prestige eligibility |
| B | Yes | |
| A | Yes | |
| S | Yes | S/SS graduates most likely to appear as rivals in future runs |
| SS | Yes | |
| Legendary | Yes | Retirement triggers prestige |

---

## Prestige Trigger

Prestige is triggered when a **Legendary adventurer retires** to found their own guild.

Full trigger conditions are **not yet re-locked** — see decisions.md open questions. Do not implement prestige trigger logic until this is closed.

---

## Kingdom View Collapse

F, E, D tier adventurers **collapse to aggregate counts** on the kingdom view. Full detail is only shown in city view and roster view.

The collapsed tiers are defined in `KINGDOM_VIEW_COLLAPSED_TIERS` in `apps/game/src/data/balance.ts`.

See ADR-009.

---

## Archetype Options

Higher tiers unlock more archetype options at prestige. Archetype definitions and unlock thresholds are **not yet designed**.

---

## Type Reference

`AdventurerTier` and `PrestigeEligibleTier` are defined in `packages/shared/src/types/adventurer.ts`.
