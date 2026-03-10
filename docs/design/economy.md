# Economy — Design Reference

**Status:** Architecture closed, values pending design pass (see decisions.md — Economy Architecture)

---

## Architecture Decision

The economy system is a **self-contained pure function with a swappable implementation**. The interface is built clean so implementations can be replaced without touching other systems.

This means:
- `processEconomy` in the tick pipe calls into an economy implementation
- The implementation can be swapped for balance testing via MCP tools
- Multiple implementations can be stubbed and compared as A/B variants

---

## What Is Decided

- Economy is a pure function — no side effects, no mutations
- Gold earning comes from buildings (per level, active vs passive — rates TBD)
- **Negative gold is intentional friction** at high scale, but needs guardrails
- **Magic Rewind** safety mechanic exists in early prestiges
- Magic Rewind is removed at a tuning-defined prestige threshold (configurable, not hardcoded)
- All values live in `apps/game/src/data/balance.ts` as stubs with TODO comments

---

## Magic Rewind

In early prestiges, if the guild goes into negative gold, a magic rewind triggers — returning the player to the last critical decision point before the deficit.

In later prestiges, this safety net is removed and players face consequences directly.

The exact prestige threshold for removing the safety net is a **tuning decision** — currently a stub in `balance.ts` as `MAGIC_REWIND_SAFETY_MAX_PRESTIGE`.

---

## What Is NOT Decided (Pending Design Pass)

| Item | Status |
|---|---|
| Gold earning rates (per building level) | Pending |
| Active vs passive income split | Pending |
| Gold costs: building upgrades | Pending |
| Gold costs: city expansion | Pending |
| Gold costs: adventurer recruitment | Pending |
| Gold costs: feasts | Pending |
| Negative gold guardrail mechanics | Pending |
| Magic Rewind prestige threshold | Tuning decision |

**Do not hardcode any of these values.** Use the stubs in `balance.ts` and leave TODO comments until the design pass closes them.

---

## Implementation Location

- System processor: `apps/game/src/systems/processEconomy.ts`
- Constants: `apps/game/src/data/balance.ts` (economy section)
- MCP tool for iteration: `balance_config_reader` in `packages/mcp`
