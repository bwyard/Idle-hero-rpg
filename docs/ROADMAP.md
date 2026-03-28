# Retired Hero's Guild — Development Roadmap

**Last updated:** 2026-03-28
**Status:** Phases 0–3 complete. Temporal Architecture adopted (ADR-012). Phase 4 next.

This document tracks the full development arc from first commit to Google Play
launch. It also calls out the portfolio milestone — the point where the project
demonstrates Staff/Principal SDET-level decisions regardless of shipping status.

Two estimates are given for each phase:
- **Solo/part-time** — evenings + weekends alongside a full-time job
- **Full-time** — dedicated focus only

Estimates are rough effort ranges, not commitments.

---

## Where We Are Right Now

Phases 0 through 3 are complete. The engine is live with a 13-system tick pipe,
full dispatch actions, demo dashboard, and all core gameplay systems stubbed or
implemented. The game renders, ticks, and responds to player actions.

| Layer | Status |
|---|---|
| Monorepo + tooling | Complete |
| Shared types | Complete |
| Pure engine (pipe, dispatch, tick) | Complete |
| 13-system tick pipe | Complete (all systems wired) |
| advanceTime | Done (365-day calendar, seasons) |
| processEventLog | Done (collect, append, trim) |
| Zustand stores | Complete, wired to MMKV |
| MMKV persistence | Wired |
| State migrations | Done |
| MCP server (4 tools) | Complete + tested |
| CI (lint, typecheck, unit, property) | Complete |
| Demo dashboard | Complete (8+ components) |
| Calendar system | Complete (365 days/yr, 4 seasons) |
| Quest board | Complete (10 templates, generation, assignment) |
| Transient visitors | Complete (arrive/hold/engage/dismiss) |
| Adventurer detail | Complete (roster, tiers, XP bars) |
| Buildings & economy | Complete (build, upgrade, expand city) |
| All branches merged | Done |

264 tests pass across 27 test files. The game renders and ticks.

**Temporal Architecture (ADR-012) adopted:** `GameEvent` now carries `causeId`
for causal linking. New systems (Phase 4+) are event-sourced from day one.
Existing systems migrate incrementally. See `docs/architecture/temporal.md`.

---

## Milestone Map

```
Phase 0   Foundation                    ████████████████  COMPLETE  (Mar 10-11)
Phase 1   Core Loop MVP                 ████████████████  COMPLETE  (Mar 12-14)
Phase 2   Adventurers & Quests          ████████████████  COMPLETE  (Mar 14-15)
Phase 3   Buildings & Economy           ████████████████  COMPLETE  (Mar 15-16)
Phase 4   Prestige & Hero System        ░░░░░░░░░░░░░░░░  → Apr 20  ★ PORTFOLIO
Phase 5   Kingdom & Depth               ░░░░░░░░░░░░░░░░  → May 10
Phase 6   Polish & Optimization         ░░░░░░░░░░░░░░░░  → May 25
Phase 7   Pre-Launch & Submission       ░░░░░░░░░░░░░░░░  → Aug 1   ★ GOOGLE PLAY
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

**Status: COMPLETE**
**Actual duration:** ~3 days (Mar 12–14)

### Deliverables completed
- [x] `processEventLog` — collect `pendingEvents`, append, trim to max length
- [x] `advanceTime` tick→year conversion (365-day calendar, 4 seasons)
- [x] `processEconomy` contract live (stub impl running via `EconomyImpl`)
- [x] Wire MMKV to Zustand `loadActiveRun` — active run loads on launch
- [x] State migration runner — load version, run migrations in sequence
- [x] First screen: guild overview — name, year, gold, adventurer count, tick timer
- [x] Navigation shell (Expo Router)
- [x] `fast-check` property tests for `tick`
- [x] Integration tests for the full tick pipeline (all 13 systems piped)
- [x] Merge all `claude/` work into `develop` via proper PRs
- [x] ID strategy closed — prefixed nanoid adopted

---

## Phase 2 — Adventurers & Quests

**Status: COMPLETE**
**Actual duration:** ~2 days (Mar 14–15)

### Deliverables completed
- [x] `processAdventurers` — XP gain per tick, tier advancement, retirement logic
- [x] `checkPrestigeConditions` — detect Legendary retirement
- [x] Adventurer recruitment system — `createId`, cost check, add to roster
- [x] `processQuests` — tick advancement, completion, reward distribution
- [x] Quest generation by region and guild tier (10 templates)
- [x] `processTransientVisitors` — arrival rate, expiry, hold mechanic
- [x] `HOLD_VISITOR`, `ENGAGE_VISITOR`, `DISMISS_VISITOR` actions in dispatch
- [x] Adventurer roster screen with per-adventurer detail
- [x] Quest board screen — available quests, assign adventurers
- [x] Visitor card UI — hold / engage / dismiss actions
- [x] Name generation — curated fantasy name tables

---

## Phase 3 — Buildings & Economy

**Status: COMPLETE**
**Actual duration:** ~1 day (Mar 15–16)

### Deliverables completed
- [x] `processBuildings` — passive income per tick, upgrade progress
- [x] Building upgrade system — cost check, progress advance, max level cap
- [x] City expansion system — unlock new building slots, cost check
- [x] BUILD_BUILDING, UPGRADE_BUILDING, EXPAND_CITY dispatch actions
- [x] `processRivals` — NPC guild tick progression (stub impl running)
- [x] Demo buttons for all building/economy actions

### Deferred to later phases
- [ ] Magic Rewind implementation (needs economy tuning pass)
- [ ] Building management screen (dedicated UI)
- [ ] Economy overview UI — income/expense breakdown
- [ ] Transient visitor service requirements (building gates)

---

## Phase 4 — Prestige & Hero System

**Goal:** A full run can complete. The prestige trigger fires, a new hero is
created, and the dynasty grows.

**Estimated duration:** 8–12 weeks part-time / 4–6 weeks full-time

### Design questions (all closed)
- ~~**ADR-006 Option 3**~~: CLOSED 2026-03-17 — hybrid model (per-hero class
  abilities + guild legacy skills). See ADR-006.

### Deliverables

#### Temporal Architecture (ADR-012) — event-sourced from day one
- [ ] Prestige as causal branch — `PRESTIGE` event preserves pre-prestige
  history, post-prestige state derives from events after the marker
- [ ] Hero identity as causal chain — hero state derived from event projections
- [ ] Dynasty meta-progression derived from cross-run event history
- [ ] Typed event discriminated unions for prestige/hero/dynasty events

#### Core systems
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

#### UI
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

#### Temporal Architecture migration (incremental)
- [ ] Existing systems enrich events to capture full state-change data
- [ ] Projection functions replace direct state reads where history matters
- [ ] Zustand store transitions: `events` becomes source of truth
- [ ] Snapshot + events-since-snapshot persistence for large event logs

#### Kingdom & world
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

| Phase | Without AI (part-time) | With AI (part-time) | Target Date | Actual |
|---|---|---|---|---|
| Phase 0 — Foundation | 3–4 weeks | 3–5 days | — | **2 days** (Mar 10–11) |
| Phase 1 — Core Loop MVP | 4–6 weeks | 2–4 days | **Mar 20** | **3 days** (Mar 12–14) |
| Phase 2 — Adventurers & Quests | 8–12 weeks | 4–7 days | **Mar 28** | **2 days** (Mar 14–15) |
| Phase 3 — Buildings & Economy | 6–10 weeks | 3–5 days | **Apr 7** | **1 day** (Mar 15–16) |
| Phase 4 — Prestige & Hero System | 8–12 weeks | 4–7 days | **Apr 20** | — |
| Phase 5 — Kingdom & Depth | 10–16 weeks | 5–8 days | **May 10** | — |
| Phase 6 — Polish & Optimization | 6–10 weeks | 3–5 days | **May 25** | — |
| Phase 7 — Pre-Launch & Submission | 8–12 weeks | 8–12 weeks* | **Aug 1** | — |

*Phase 7 is not compressible — Google Play review, beta testing tracks, and
real-device testing all run on calendar time, not coding time.

**Without AI — Google Play launch window: Q3–Q4 2027**

**With AI — Google Play launch window: Q3–Q4 2026**
The bottleneck shifts entirely from implementation to your decision bandwidth.
Every phase waits on design conversations (economy pass, etc.)
not on code being written. ID strategy and Option 3 are both closed.

**Portfolio milestone (end of Phase 4):**
- Without AI: Q4 2026–Q1 2027
- With AI: **4–6 weeks from today if design decisions are ready**

---

## Critical Path

The items below directly gate the next milestone. Delaying any of them delays
everything downstream.

1. ~~**Close ID strategy decision**~~ — CLOSED. Prefixed nanoid adopted.
2. ~~**Merge `claude/` branches to `develop`**~~ — CLOSED. All PRs merged to dev.
3. ~~**Option 3 resolution (shared vs per-leader hero ability system)**~~ — CLOSED 2026-03-17. Hybrid model adopted. See ADR-006.
4. ~~**Economy design conversation**~~ — CLOSED. Placeholder values active, interface-first pattern proven.

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
