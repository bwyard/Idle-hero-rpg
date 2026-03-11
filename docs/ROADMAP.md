# Retired Hero's Guild — Development Roadmap

**Last updated:** 2026-03-11
**Status:** Phase 0 complete. Phase 1 in progress.

This document tracks the full development arc from first commit to Google Play
launch. It also calls out the portfolio milestone — the point where the project
demonstrates Staff/Principal SDET-level decisions regardless of shipping status.

Two estimates are given for each phase:
- **Solo/part-time** — evenings + weekends alongside a full-time job
- **Full-time** — dedicated focus only

Estimates are rough effort ranges, not commitments.

---

## Where We Are Right Now

The foundation is solid. The engine architecture is correct. The tooling is
complete. **Nothing renders.** The gap between "current state" and a game a
player can interact with is the entire application layer.

| Layer | Status |
|---|---|
| Monorepo + tooling | Complete |
| Shared types | Complete |
| Pure engine (pipe, dispatch, tick) | Complete |
| All 12 system stubs | Stubbed — not implemented |
| Zustand stores | Shape defined, not wired |
| MMKV persistence | Not wired |
| State migrations | Not implemented |
| MCP server (4 tools) | Complete + tested |
| CI (lint, typecheck, unit, property) | Complete |
| Screens | **None** |

52 tests pass. The architecture decisions are locked. The game has never been
seen by a human.

---

## Milestone Map

```
Phase 0   Foundation                    ████████████████  COMPLETE
Phase 1   Core Loop MVP                 ░░░░░░░░░░░░░░░░  next
Phase 2   Adventurers & Quests          ░░░░░░░░░░░░░░░░
Phase 3   Buildings & Economy           ░░░░░░░░░░░░░░░░
Phase 4   Prestige & Hero System        ░░░░░░░░░░░░░░░░
Phase 5   Kingdom & Depth               ░░░░░░░░░░░░░░░░
Phase 6   Polish & Optimization         ░░░░░░░░░░░░░░░░
Phase 7   Pre-Launch & Submission       ░░░░░░░░░░░░░░░░
```

**Portfolio milestone:** end of Phase 4. Architecture is demonstrated,
prestige system is live, pure engine is proven in a real application. This is
the point a hiring panel can evaluate the project seriously.

**Launch milestone:** end of Phase 7. Game is on Google Play.

---

## Phase 0 — Foundation

**Status: COMPLETE**
**Actual duration:** ~3–4 weeks part-time

### Deliverables completed
- [x] Turborepo monorepo (ADR-002)
- [x] Expo managed workflow + Dev Client
- [x] Zustand stores (shape defined)
- [x] All 11 ADRs written (001–011)
- [x] Shared types: full domain model
- [x] Pure engine: `pipe`, `dispatch`, `tick`, all 12 system stubs
- [x] MCP server: 4 tools, 30 tests
- [x] 52 tests across 9 test files (unit + property)
- [x] GitHub Actions CI (lint, typecheck, unit, property, E2E on PRs)
- [x] Husky + lint-staged + commitlint
- [x] PR template
- [x] `develop`/`main` branch structure
- [x] `docs/decisions.md` + design docs per domain

### Still needs closing from this phase
- [ ] `claude/` branches merged to `develop` — git workflow gap (no work has
  reached `develop` yet)
- [ ] `no-any` ESLint rule verified as error not warning
- [ ] ID strategy decision formally closed in `decisions.md`

---

## Phase 1 — Core Loop MVP

**Goal:** The game ticks. Something renders. A player can watch the guild earn
gold and see adventurers exist.

**Estimated duration:** 4–6 weeks part-time / 2–3 weeks full-time

### Blockers to clear first
- Close ID strategy decision → `createId(prefix)` factory in `packages/shared`
- Economy design pass → fill `balance.ts` stubs (earning rates, costs, guard
  rails). This is the longest-lead item: it requires a design conversation
  before code can be written.

### Deliverables
- [ ] `processEventLog` — collect `pendingEvents`, append, trim to max length
- [ ] `advanceTime` tick→year conversion (real math, not stub)
- [ ] `processEconomy` — passive income per tick, negative gold detection,
  Magic Rewind trigger condition
- [ ] Wire MMKV to Zustand `loadActiveRun` — active run loads on launch
- [ ] State migration runner — load version, run migrations in sequence
- [ ] First screen: guild overview — name, year, gold, adventurer count, tick
  timer visible to player
- [ ] Navigation shell (Expo Router) — at minimum: one tab or stack entry point
- [ ] `fast-check` property tests for `tick` — arbitrary `GameState` in,
  shape invariants out
- [ ] Integration tests for the full tick pipeline (all 12 systems piped)
- [ ] Merge all `claude/` work into `develop` via proper PRs

### Definition of done
A developer (not a player) can launch the app, see a guild screen, watch the
year counter advance, and see gold change. No recruitment, no quests. Just a
live ticking game state displayed on screen.

---

## Phase 2 — Adventurers & Quests

**Goal:** The core idle loop is playable. Adventurers exist, go on quests, gain
XP, and tier up.

**Estimated duration:** 8–12 weeks part-time / 4–6 weeks full-time

### Deliverables
- [ ] `processAdventurers` — XP gain per tick, tier advancement (F → Legendary),
  retirement logic
- [ ] `checkPrestigeConditions` — detect Legendary retirement, set
  `flags.prestigeAvailable`
- [ ] Adventurer recruitment system — `createId`, cost check, add to roster
- [ ] `processQuests` — tick advancement, completion, reward distribution
- [ ] Quest generation by region and guild tier
- [ ] `processTransientVisitors` — arrival rate, expiry, hold mechanic
- [ ] `HOLD_VISITOR`, `ENGAGE_VISITOR`, `DISMISS_VISITOR` actions in dispatch
- [ ] Adventurer roster screen — list (custom virtualizer per ADR-008),
  per-adventurer detail
- [ ] Quest board screen — available quests, assign adventurers, in-progress view
- [ ] Visitor card UI — hold / engage / dismiss actions
- [ ] Name generation — decision closed in `decisions.md`, curated fantasy
  name tables implemented
- [ ] Progressive disclosure for F/D/C tiers on aggregate views (ADR-009)

### Definition of done
A player can recruit adventurers, send them on quests, watch them return with
gold and XP, and see them tier up over time. Transient visitors arrive and can
be interacted with.

---

## Phase 3 — Buildings & Economy

**Goal:** The economy loop is real. Buildings produce income. Upgrades cost
gold. Negative gold has consequences.

**Estimated duration:** 6–10 weeks part-time / 3–5 weeks full-time

### Blockers to clear first
- Economy design pass must be complete (values in `balance.ts`). This phase
  cannot start until Phase 1's economy design conversation is closed.

### Deliverables
- [ ] `processBuildings` — passive income per tick, upgrade progress
- [ ] Building upgrade system — cost check, progress advance, unlock next tier
- [ ] City expansion system — unlock new building slots, cost check
- [ ] Magic Rewind implementation — save last decision point, trigger on
  negative gold in early prestiges, threshold from `balance.ts`
- [ ] Building management screen — current buildings, upgrade options, cost
  visibility
- [ ] Economy overview UI — income/expense breakdown, gold trend
- [ ] Transient visitor service requirements (building gates per service type)
- [ ] `processRivals` — NPC guild tick progression, minimum tenure enforcement,
  S/SS graduate population

### Definition of done
Building income drives the economy. Upgrades feel meaningful. Running out of
gold early has a visible consequence (Magic Rewind). Rival guilds exist in the
world state.

---

## Phase 4 — Prestige & Hero System

**Goal:** A full run can complete. The prestige trigger fires, a new hero is
created, and the dynasty grows.

**Estimated duration:** 8–12 weeks part-time / 4–6 weeks full-time

### Open design question that must close before this phase
- **ADR-006 Option 3**: shared vs per-leader hero ability system. CLAUDE.md
  flags this as unresolved. It must be closed before the hero system is built.

### Deliverables
- [ ] `processHero` — passive ability effects, action point regen, career
  milestone tracking
- [ ] Hero class ability system (passive + career milestone active per class)
- [ ] `checkForcedPrestige` — forced window detection, Year 25/30/35/40/45
  for prestiges 1–6
- [ ] `checkLeaderPressure` — involuntary leader replacement rules by prestige
  tier
- [ ] Full prestige flow — Legendary retires, career converts to hero class
  options, player selects next leader
- [ ] Run 1 class selection menu (no prior career to convert)
- [ ] Dynasty layer wiring — `loadDynastyLayer` deferred load after first render
- [ ] State version + migration for dynasty data
- [ ] Wire MMKV dynasty layer to Zustand
- [ ] Prestige flow UI — retire screen, career summary, class selection
- [ ] Hero overview screen — current hero, passive ability, action points,
  career milestone progress
- [ ] Conclave screen — dynasty growth summary, Skill Borrow reset indicator

### Definition of done
A player can complete a full 50-year run, trigger the prestige condition, select
a new hero class based on the retiring adventurer's career, and begin run 2
with dynasty bonuses from run 1.

> **Portfolio milestone reached here.** The architecture is live: pure engine,
> prestige loop, dynasty meta-progression, all ADRs proven in a real system.

---

## Phase 5 — Kingdom & Depth

**Goal:** The world feels like a world. Kingdom map is interactive. Rivals have
real history. Dynasty reputation grows.

**Estimated duration:** 10–16 weeks part-time / 5–8 weeks full-time

### Deliverables
- [ ] Kingdom map — `react-native-svg` implementation (ADR approved), 5
  regions, 15–20 locations, 1 capital (Heartlands start, Capital Region end)
- [ ] Region unlocking — Coast, Mountains, Wilds, Capital Region
- [ ] City view — buildings, adventurers assigned, local quests, detail screen
- [ ] `processConclave` — 5-year milestone, dynasty growth categories, Skill
  Borrow reset
- [ ] Skill Borrow mechanic — once per Conclave cycle, borrow from high-tier
  roster adventurer
- [ ] World awareness tiers — dynasty hidden (prestiges 1–2), scaling to
  Mythic (prestige 16+)
- [ ] Master Mentor ability — unlocks at prestige 10, costs 2 action points,
  guides adventurer toward specific milestones
- [ ] Hall of Heroes — S/SS graduates from prior runs as NPC rivals with real
  history
- [ ] Guild relationship tiers by prestige (Affiliate → World event)
- [ ] Dynasty meta-progression UI — permanent bonuses, world awareness,
  unlocked heroes and cities, legacy history

### Definition of done
The kingdom map is interactive. Multiple regions are accessible across runs.
NPC rival guilds appear with names and histories pulled from prior prestige
events. World awareness tier is visible to the player.

---

## Phase 6 — Polish & Optimization

**Goal:** The game feels complete. Performance is validated. Accessibility is
implemented. Edge cases are handled.

**Estimated duration:** 6–10 weeks part-time / 3–5 weeks full-time

### Deliverables
- [ ] Custom fixed-height virtualizer for roster list (ADR-008) — final
  implementation, tested at 1000+ adventurers
- [ ] Performance profiling — tick pipe benchmarked, secondary indexes added
  to `GameState` only if filtering is a measurable hotspot
- [ ] Accessibility implementation per ADR-011 — screen reader labels,
  minimum touch targets, contrast ratios
- [ ] Feature gating and entitlements (ADR-010) — implemented for any premium
  or unlock-gated content
- [ ] Animation and haptics — meaningful feedback on prestige, tier-up,
  quest completion
- [ ] History layer — loads guild history on demand only (ADR-003 layered
  loading, final layer)
- [ ] Full E2E Cypress suite against Expo Web — happy path: launch → recruit →
  quest → tier up → prestige
- [ ] Save/load stress test — export state, import, verify game resumes
  correctly
- [ ] Edge case: negative gold in late prestiges (no Magic Rewind)
- [ ] Edge case: 0 adventurers (empty roster handling)
- [ ] Edge case: prestige 16+ multi-condition requirements met simultaneously

---

## Phase 7 — Pre-Launch & Google Play Submission

**Goal:** The game is in players' hands.

**Estimated duration:** 8–12 weeks part-time / 4–6 weeks full-time

### One-time setup (do this earlier, not at the last minute)
- [ ] Google Play Console account — $25 one-time fee, requires 2–3 day review
  for new accounts. Set up before Phase 6 is done.
- [ ] App signing — generate upload keystore, store it safely (not in git)
- [ ] `applicationId` confirmed in `app.json`

### Store listing
- [ ] App icon — final asset, meets Play Store requirements
- [ ] Feature graphic (1024×500)
- [ ] Screenshots — phone and tablet (minimum 2, recommend 8)
- [ ] Short description (80 chars) and full description
- [ ] Content rating questionnaire
- [ ] Privacy policy — required if app collects any data; host publicly

### Achievement stubs activation
- [ ] `AchievementKey` type in shared types (already stubbed per CLAUDE.md) →
  wire to real Google Play Games Services SDK
- [ ] Achievement events mapped to `GameEvent.achievementKey` field

### Release track progression
- [ ] Internal testing (team only) — smoke test release build on real device
- [ ] Closed testing (invited testers) — 2–4 weeks, gather balance feedback
- [ ] Open testing (public beta) — 2–4 weeks, address stability reports
- [ ] Production release

### Definition of done
The game is live on Google Play in production with a public listing, at least
one public review, and a stable crash-free session rate ≥ 99%.

---

## Estimated Timeline to Google Play

Working assumptions:
- Solo developer
- Part-time pace (evenings + weekends ~10–15 hrs/week)
- AI-assisted column assumes Claude Code doing implementation, human providing
  design decisions and review
- Design conversation time is not compressible regardless of AI assistance —
  it requires your thinking, not code generation

| Phase | Without AI (part-time) | With AI (part-time) | Actual |
|---|---|---|---|
| Phase 0 — Foundation | 3–4 weeks | 3–5 days | **2 days** (Mar 10–11 2026) |
| Phase 1 — Core Loop MVP | 4–6 weeks | 2–4 days | — |
| Phase 2 — Adventurers & Quests | 8–12 weeks | 4–7 days | — |
| Phase 3 — Buildings & Economy | 6–10 weeks | 3–5 days | — |
| Phase 4 — Prestige & Hero System | 8–12 weeks | 4–7 days | — |
| Phase 5 — Kingdom & Depth | 10–16 weeks | 5–8 days | — |
| Phase 6 — Polish & Optimization | 6–10 weeks | 3–5 days | — |
| Phase 7 — Pre-Launch & Submission | 8–12 weeks | 8–12 weeks* | — |

*Phase 7 is not compressible — Google Play review, beta testing tracks, and
real-device testing all run on calendar time, not coding time.

**Without AI — Google Play launch window: Q3–Q4 2027**

**With AI — Google Play launch window: Q3–Q4 2026**
The bottleneck shifts entirely from implementation to your decision bandwidth.
Every phase waits on design conversations (economy pass, Option 3, ID strategy)
not on code being written.

**Portfolio milestone (end of Phase 4):**
- Without AI: Q4 2026–Q1 2027
- With AI: **4–6 weeks from today if design decisions are ready**

---

## Critical Path

The items below directly gate the next milestone. Delaying any of them delays
everything downstream.

1. **Economy design conversation** — gates `processEconomy`, `processBuildings`,
   Magic Rewind, and cost systems across Phases 1–3. Longest-lead design item
   in the project.
2. **Close ID strategy decision** — gates recruitment, visitor system, quest
   assignment, and any system that creates a live game object.
3. **Merge `claude/` branches to `develop`** — gates the actual git history
   being coherent. Currently zero commits have reached `develop`.
4. **Option 3 resolution (shared vs per-leader hero ability system)** — must
   close before Phase 4 hero system implementation begins.

---

## Deferred — Post-Launch Only

Per CLAUDE.md, these are explicitly not in scope until the core loop ships:

- iOS support
- Google Play Games Services / Achievements (stubs exist, wiring deferred)
- Multiple kingdoms (post-launch expansion)
- Branch merging conditions (one hero upgrading to take over two locations)
- Detox mobile E2E (requires Mac)
- Development dashboard (revisit after core systems are built)
- NPC guild minimum tenure tuning numbers

---

*Update this document when a phase completes or estimates change. Do not let it
drift from reality — it should tell the truth about where the project is.*
