# Skill System — Design Reference

**Status:** Closed (see decisions.md — Skill System)

---

## Model

- A **global skill pool** exists across the entire game
- At run start, your **hero class gates the subset** of the pool available to you
- During a run, **activities and milestones can modify your pool** — including pushing outside class defaults
- The player **chooses which skills to develop** from their available pool

---

## Skill Borrow

- **When:** Once per Conclave cycle (every 5 in-game years)
- **Who:** A Legendary adventurer in your roster who has reached 2× SS rank
- **What:** The hero borrows a skill from that adventurer's pool for the cycle
- **Permanence:** Whether borrowed skills become permanent is a **flex/tuning decision** — the code must support both paths

---

## Option 3 Resolution

The previously open question "shared vs per-leader ability system (Option 3)" is **resolved** by this model:
- One shared global skill pool
- Each leader accesses a class-gated subset
- Pool modifications via milestones and Skill Borrow create per-leader variation organically

This is no longer an open design question.

---

## Implementation Notes

- Skill pool is **not yet designed** at the individual skill level — names, effects, unlock conditions
- The data shape for skills will live in `packages/shared` when designed
- The system processor is `processHero` in the tick pipe
- Gate predicates (which skills are available to a given hero) will live in a dedicated utility per ADR-010

---

## Open Items

- Individual skill definitions (names, effects, unlock conditions) — not yet designed
- Pool modification mechanics (exactly how milestones push outside defaults) — not yet designed
