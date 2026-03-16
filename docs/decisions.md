# Retired Hero's Guild — Decisions & Session Tracking

This file tracks closed design decisions, open questions, and session history.
It is NOT CLAUDE.md. CLAUDE.md points here for detail. Read sections on demand.

---

## Closed Decisions

### Terminology
- **Hero** = player character (code/design docs only)
- **Adventurer** = NPC guild members
- **Guild Leader** = in-game UI label (exact wording TBD, not a dev concern yet)
- Guild Leader is present in some systems but not all — not a field unit, intervenes selectively
- Guild Leader can go on personal activities but requires high-tier adventurer coverage during absence and cannot make guild-level decisions while gone
- Absence system pros/cons = future tuning conversation

### Hero Classes
- Active classes (5): Warblade, Wanderer, Archmage, Diplomat, Bard
- Possible future classes (not designed): Shadow, Paladin
- Each class gates a subset of the global skill pool
- Each class has a passive ability and a career milestone active ability
- Class unlocks expand across runs via dynasty meta-progression

### Skill System
- Global skill pool exists across the game
- Hero class gates your available subset at run start
- Activities and milestones during a run can modify your pool — including pushing outside class defaults
- Player chooses which skills to develop from their available pool
- **Skill Borrow** = late-game mechanic, once per Conclave cycle, borrow from a high-tier adventurer in roster
- Borrowed skills becoming permanent = flex/tuning decision — code to support either path
- Option 3 (shared vs per-leader ability system) = resolved by this model, no longer open

### Prestige — LOCKED (2026-03-10)
- F, E, D tiers = never prestige-eligible
- C through Legendary = prestige-eligible, C is the entry point
- Prestige is story not mechanics — adventurer retires and founds own guild, their career converts to next hero class
- Run 1: class selection menu only (no prior career to convert)
- Starting context: player is a retired legendary hero, backstory involves a cataclysmic event — details deferred
- Legacy Track fills via: years in guild, quests, mentor sessions, achievements, loyalty consistency
- Each tier has visible guild presence (gold nameplate at C through portrait on wall at Legendary)
- Tier benefits: more hero class options unlock at higher tier — player sees why each option is available
- Adventurer class → hero class conversion table locked (see docs/design/prestige.md)
- Hero class ability pools locked (passive + career milestone active per class)
- Skill Borrow: Legendary hero with 2 SS in roster, once per Conclave — whether it becomes permanent is tuning TBD
- Escalating prestige requirements table locked (1–3 prestiges: 1 at C+, scaling up to 16+: 1 Legendary or 2 SS etc.)
- Forced prestige windows locked: Year 25/30/35/40/45 for prestiges 1–6, free at 7+
- Involuntary leader replacement rules locked by prestige tier
- Guild continues after prestige, 50yr run max, 75–100yr guild life, up to 4 leaders, minimum 2 guaranteed
- Previous guilds become NPC rivals with real history
- Tutorial prestige sequence: ideas exist (Branch → Affiliate → merge → fresh guild), not locked, deferred
- Full detail: docs/design/prestige.md

### Guild Relationship Tiers by Prestige
| Prestige Tier | Relationship Created |
|---|---|
| C | Affiliate |
| B | Branch |
| A | Chapter or fresh guild |
| S | HQ |
| SS | Independent Guild |
| Legendary | World event |

### World Awareness
- Prestiges 1-2: world unaware of dynasty
- Scales with prestige count
- Prestige 16+: mythic status

### Master Mentor
- Unlocks at prestige 10
- Costs 2 action points
- Guides adventurer toward specific milestones

### Economy Architecture
- Economy system = self-contained pure function, swappable implementation
- Build the interface clean, let implementations be replaceable
- Gold earning rates, costs, and negative gold guardrails = full design pass pending
- Magic Rewind safety mechanic exists in early prestiges, removed at a tuning-defined threshold
- Do not hardcode economy values — use balance.ts stubs with TODO comments

### Interface-First Pattern for Pending Design Decisions (CLOSED 2026-03-11)
When a system depends on values or rules not yet designed, build against a typed
interface rather than blocking on the design conversation. A stub implementation
satisfies the interface, keeps CI green, and ships with the system as the default.
The design conversation happens when values need to be tuned — not before.

Implemented for: `EconomyImpl`, `BuildingProductionImpl`, `AdventurerProgressionImpl`,
`QuestRewardImpl`, `HeroAbilityImpl`, `RivalProgressionImpl`

Interfaces live in `packages/shared/src/types/systemImpls.ts`.
Contract tests live in `apps/game/src/__tests__/systemContracts.test.ts`.
These tests are the acceptance criteria for any live implementation.

### Architecture Flexibility Principle
- Open design decisions are not blockers — they are test cases for architecture flexibility
- Build interfaces and stub multiple implementations
- MCP balance tools serve as A/B testing infrastructure for design variants
- Document deliberate flexibility as an architectural decision in ADRs

### Claude Code Workflow
- Model: **Sonnet only across all surfaces** — Opus disabled
- Claude Code can commit, push, open PRs
- Claude Code cannot merge, close, or delete PRs — merge gate stays with developer on GitHub
- PowerShell profile enforces git CLI safeguards at shell level, loads on every session
- Safeguards are environmental, not per-session configuration

### Session and Context Management
- CLAUDE.md stays lean — architecture rules, non-negotiables, pointers to other MDs
- Detailed MDs live in docs/ and are loaded on demand, not all at once
- MCP server built early (sprint 1-2) — not deferred
- MCP tools serve as test harness for the pure functional engine
- Fresh sessions load sprint MD + relevant MDs via MCP — no stale conversation history
- End of session: state written back via update scripts, next session picks up clean

### Testing
- Tests written alongside features, not after
- No system ships without tests
- Vitest + fast-check for engine unit and property tests
- MCP tooling and Vitest test the same pure functions through different surfaces
- Vitest = CI gates, MCP = interactive development iteration

### Git Workflow
- Branch: feature/*, fix/*, chore/* from develop
- PRs merge to develop, develop to main via PR when stable
- Never commit directly to main or develop
- Conventional commits enforced via Husky + lint-staged
- PowerShell profile enforces destructive command restrictions at shell level

### Portfolio Narrative
- AI used as execution accelerator, not architecture replacement
- Architecture decisions live in developer's head and ADRs
- CLAUDE.md is the contract between developer intent and AI execution
- Workflow system (session tracking, MCP, PowerShell profile, guardrails) is itself a portfolio artifact
- Claude Code listed in README under tools — not mentioned in individual PRs
- Ownership demonstrated through PR descriptions, ADRs, test coverage, architectural explanation

---

### Accessibility
- Accessibility is a first-class concern, not a retrofit
- Engine layer requires no changes — pure functional architecture means accessibility is entirely a UI layer concern
- UI commitments: `accessibilityLabel` + `accessibilityRole` on all interactive elements, `announceForAccessibility` for significant state changes
- Minimum 44×44dp touch targets, no exceptions
- Text in `sp` units — layouts must hold at 200% text scale
- Reduce motion: query `AccessibilityInfo.isReduceMotionEnabled`, all animations have instant fallbacks
- WCAG AA contrast ratios minimum (4.5:1 text, 3:1 UI components)
- Tier identity never conveyed by colour alone — always paired with label or icon
- Deferred: specific colour palette, explicit in-game high-contrast mode
- Full detail: docs/adr/011-accessibility.md

### Monetization Architecture
- Specific monetization model = undecided, multiple options viable (cosmetic only, one-time purchase, optional supporter tier, convenience tier)
- **Architectural decision locked:** feature gating layer built in from day one
- Entitlements/capabilities object is part of state shape early — any feature can be gated or ungated via configuration
- Pure functional architecture makes this clean — gate is a predicate wrapping a system or UI component, not retrofitted logic
- No energy systems, stamina gates, loot boxes, or mechanics that make free players feel a hard ceiling
- Monetization model decided later — architecture supports any of them without code changes

---

## Open Questions

| Question | Status | Blocking |
|---|---|---|
| Prestige trigger conditions full design | **CLOSED 2026-03-10** — see docs/design/prestige.md | No |
| Economy full design pass | Pending dedicated session | No — use stubs |
| Magic Rewind prestige threshold | Tuning decision | No — code as configurable |
| Branch merging conditions | Deferred until core systems stable | No |
| NPC guild minimum tenure numbers | Principle locked, numbers need tuning | No |
| Monetization model selection | Architecture ready, model undecided | No |
| Guild Leader in-game UI label | TBD, not a dev concern yet | No |
| Guild Leader absence system tuning | Future design conversation | No |
| Development dashboard | Revisit after core systems built | No |
| Detox mobile E2E | Revisit if Mac available | No |

---

## Session Log

### 2026-03-10 — Prestige System Design Lock
**Topics covered:**
- Full prestige design recovered and locked
- Legacy Track mechanics locked (what fills it)
- Adventurer tier visibility in guild locked
- Prestige benefits / hero class options table locked
- Adventurer class → hero class conversion table locked
- Hero class ability pools locked (all 5 classes)
- Skill Borrow mechanic locked (tuning detail on permanence still flexible)
- Escalating prestige requirements table locked
- Forced prestige windows locked (Years 25/30/35/40/45, free at 7+)
- Involuntary leader replacement rules locked
- Starting context locked: retired legendary hero, cataclysm backstory deferred
- Tutorial prestige sequence: ideas noted, not locked, deferred

**Outputs:**
- docs/design/prestige.md rewritten — full locked design
- docs/decisions.md updated — prestige open question closed

**Still TBD from this session:**
- Tutorial prestige sequence exact structure
- Cataclysm backstory details
- NPC guild minimum tenure numbers (tuning)

---

### 2026-03-10 — Design and Workflow
**Topics covered:**
- Hero vs adventurer terminology locked
- Skill system design locked
- Guild Leader presence in systems clarified
- Prestige trigger status: partially recovered, full pass needed
- Architecture flexibility principle established — open decisions are test cases not blockers
- Claude Code workflow and guardrails defined
- PowerShell profile as enforcement layer
- Session and context management strategy — lean CLAUDE.md, on-demand MDs, MCP as harness
- Sonnet-only model decision
- Portfolio narrative framing
- Economy as swappable component pattern

**Outputs:**
- CLAUDE.md created (see outputs)
- This decisions.md created

**Next sessions needed:**
1. Prestige trigger design — pull from old session, lock down, update this file immediately
2. Workflow and tooling — PowerShell profile, session tracking, parallel work, docs folder structure
3. Economy design pass — when ready, implement as swappable component

---

## Pointer Map

| Topic | Location |
|---|---|
| Architecture rules | CLAUDE.md |
| ADRs | docs/adr/ |
| Sprint scope and status | docs/sessions/current-sprint.md |
| System deep dives | docs/architecture/ |
| Finalized design per feature | docs/design/ |
| Balance constants | apps/game/src/data/balance.ts |
| This file | docs/decisions.md |
