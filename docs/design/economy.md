# Economy — Design Reference

**Status:** Interface-first pattern implemented. Architecture closed. Values pending design pass — not a blocker.

---

## Architecture Decision

The economy system is a **self-contained pure function with a swappable implementation**. The interface is built clean so implementations can be replaced without touching other systems.

This means:
- `processEconomy` in the tick pipe calls into an economy implementation
- The implementation can be swapped for balance testing via MCP tools
- Multiple implementations can be stubbed and compared as A/B variants

## Interface-First Implementation (live as of 2026-03-11)

All economy-adjacent systems now use typed implementation interfaces defined
in `packages/shared/src/types/systemImpls.ts`. Stub implementations ship with
each system and serve as the default until a live implementation is written.

| Interface | Stub | System |
|---|---|---|
| `EconomyImpl` | `stubEconomyImpl` | `processEconomy.ts` |
| `BuildingProductionImpl` | `stubBuildingProductionImpl` | `processBuildings.ts` |
| `AdventurerProgressionImpl` | `stubAdventurerProgressionImpl` | `processAdventurers.ts` |
| `QuestRewardImpl` | `stubQuestRewardImpl` | `processQuests.ts` |
| `HeroAbilityImpl` | `stubHeroAbilityImpl` | `processHero.ts` |
| `RivalProgressionImpl` | `stubRivalProgressionImpl` | `processRivals.ts` |

Contract tests in `apps/game/src/__tests__/systemContracts.test.ts` validate
invariants that must hold for any implementation — stub or live. Writing a live
impl requires passing these tests; the test file is the acceptance criteria.

**To write a live EconomyImpl:**
1. Implement `EconomyImpl` from `@idle-hero-rpg/shared`
2. Fill in values from `balance.ts` (requires design pass to be closed)
3. Pass all tests in `systemContracts.test.ts`
4. Inject via `processEconomy(state, myLiveEconomyImpl)` in the Zustand tick call

---

## What Is Decided

- Economy is a pure function — no side effects, no mutations
- Gold earning comes from buildings (per level, active vs passive — rates TBD)
- **Negative gold is intentional friction** at high scale, but needs guardrails
- **Magic Rewind** safety mechanic exists in early prestiges
- Magic Rewind is removed at a tuning-defined prestige threshold (configurable, not hardcoded)
- All values live in `apps/game/src/data/balance.ts` as stubs with TODO comments
- **Currency is a three-tier handoff, not a single ever-climbing number** — see below

---

## Currency Tier Handoff (locked 2026-09-18)

The economy is not a traditional incremental where one number climbs forever.
Instead, the currency you actively manage changes as automation takes over the
tier below it.

| Tier | Currency | Active while... | Handoff trigger |
|---|---|---|---|
| 1 | **Gold** (copper/silver/gold denominations) | You manually assign quests, upgrade buildings, recruit | — |
| 2 | **Reputation** | Quest-sending *and* building management are both automated | Both automations unlocked |
| 3 | **Dynasty Power** | Reputation-era systems (diplomacy, alliances) automate too | Deferred — depends on Phase 5 Guild Score infra, not specced here |

The superseded currency does **not** freeze or become cosmetic. It keeps
growing forever, earned and spent automatically by whatever system replaced
manual management — guardrails below (negative gold, Magic Rewind) still
apply to it at every tier, since it's still live, just unsupervised.

### Gold denominations

Single underlying integer, stored in copper (the smallest unit) — same field
(`Guild.gold`), no type change. Display-layer re-denominates by magnitude so
the number never reads as an absurd raw integer:

- 1,000 copper = 1 silver
- 1,000 silver = 1 gold

Early-game balances read in copper, late-game in gold — same growth curve,
different denomination, which is the actual fix for "the number gets
unreadable" rather than hiding it behind abbreviations.

### Reputation activation

`Guild.reputation` already exists in the type as a dormant field (initialized
to 0, displayed in `StatsBar`, no earn/spend logic). It activates once both:
- Quest-sending automation is unlocked
- Building-management automation is unlocked

Both are recommended to bind to the same `WorldAwarenessTier` transition
(`idle-progression.md` already gates idle autonomy on this ladder) rather
than introducing a separate unlock system. Candidate: the **Regional**
transition (prestige 5–7), where the idle cap already jumps to a full season
— the same "guild starts running itself" narrative beat. Exact tier binding
and the automation systems themselves (auto-quest-assignment,
auto-building-upgrade logic) are **not yet built** — tracked separately in
`TODO.md`, since they're their own feature, not a byproduct of the currency
model.

### Dynasty Power

Named in the vision doc (`CLAUDE.md` Guild Score pillars) as "accumulated
strength across all prestiges." Positioned here as the third handoff tier
conceptually, but has no type, no earn logic, and depends on Guild Score
infrastructure that doesn't exist yet (Phase 5, per `docs/ROADMAP.md`). Do
not implement until Phase 5 Guild Score work starts.

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
