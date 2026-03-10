# Hero Classes — Design Reference

**Status:** Closed (see decisions.md — Hero Classes)

---

## Classes

| Class | Focus |
|---|---|
| Warblade | Combat |
| Wanderer | Exploration |
| Archmage | Magic |
| Diplomat | Relations |
| Bard | Influence |
| Shadow | Stealth / subterfuge |
| Paladin | Faith / protection |

---

## Rules

- Each class **gates a subset of the global skill pool** — you start a run with access to your class's subset
- Each class has:
  - A **passive ability** active for the full run
  - A **career milestone active ability** unlocked mid-run
- Activities and milestones during a run can **push outside class defaults** — the pool is not a hard ceiling
- Class unlocks **expand across runs** via dynasty meta-progression — later runs can access more classes at prestige

---

## Starting Class (Run 1)

Run 1 uses a class selection menu — no prestige conversion exists yet.

---

## Prestige Class Conversion

From Run 2 onward, the retiring Legendary adventurer's career (class, stats, milestones) converts to the hero class for the next leader. See `docs/design/prestige.md` (once prestige design is re-locked).

---

## Skill Borrow

A Legendary adventurer who has reached 2× SS rank can **Skill Borrow** once per Conclave cycle — lending a skill from their pool to the hero.

Whether borrowed skills become permanent is a **flex/tuning decision** — the code must support both paths.

---

## Type Reference

`HeroClass` is defined in `packages/shared/src/types/hero.ts`.

---

## Open Items

None — class list is closed. Passive and active ability definitions are **not yet designed** and will be added to this file when locked.
