CLAUDE.md — Retired Hero's Guild
This file is the authoritative project briefing for Claude Code. Read it fully before touching any file.

## Session & Todo System
Shared session state and todos live in `../claude-resources/` (one level up from this repo).

- Session file:    `../claude-resources/sessions/idle-hero/current.md`
- Session history: `../claude-resources/sessions/idle-hero/s000-s009/` etc.
- Todo CLI:        `node ../claude-resources/todos/todo.js list --project idle-hero`
- Dashboard:       `node ../claude-resources/todos/todo.js dashboard`
- Nav hub:         `../claude-resources/CLAUDE.md`

Read `current.md` at the start of every session. Update it and write a closed session log at the end.
Project Overview
Retired Hero's Guild is a mobile idle clicker tycoon built with React Native and Expo.
The player is a retired legendary adventurer who founds a guild and builds it into a dynasty empire across a Fiore-scale kingdom. The goal is to be the greatest guild in the world. There is no demon lord, no forced story ending. Empire building is the point.
Platform: Android primary. iOS future. Web (Expo Web) for E2E testing only.
Development machine: Windows
Repo: Public GitHub. PR and feature branch workflow. This is also a portfolio project targeting Staff/Principal SDET roles.
Repository Structure
/
├── apps/
│   └── game/                        # React Native / Expo app
│       └── src/
│           ├── data/
│           │   └── balance.ts       # ALL numeric constants live here
│           ├── engine/              # Pure functional tick and dispatch
│           ├── systems/             # Individual system processors
│           ├── stores/              # Zustand stores (game state + UI state)
│           ├── screens/
│           ├── components/
│           └── __tests__/
├── packages/
│   ├── shared/                      # Shared TypeScript types, barrel exports by domain
│   └── mcp/                         # MCP server (TypeScript, Zod)
├── e2e/                             # Cypress E2E against Expo Web target
├── turbo.json
└── CLAUDE.md
Architecture Rules — Non-Negotiable
Pure Functional Engine
The tick and dispatch functions are pure functions. No exceptions.
No mutations inside tick or dispatch
No side effects inside tick or dispatch
Use the pipe utility to chain transformations
UI is a swappable layer over the engine — the engine has no knowledge of React
Balance Constants
Every numeric constant lives in apps/game/src/data/balance.ts. Never hardcode magic numbers in engine or system files. If you are writing a number directly into a system file, stop and add it to balance.ts first.
Static vs Dynamic State
Static data (hero class definitions, building templates, quest templates, adventurer archetypes) is never stored in the save file. Separate completely from dynamic game state.
State Versioning
State versioning and migrations are active from day one. Every GameState object carries a version field. Migrations run on load before the state is handed to any system.
Collections as Records
GameState uses Record<string, T> keyed by ID for all collections — adventurers, cities, buildings, quests. Never use arrays for things you look up by ID.
Three-Layer State Loading
Active run — loads immediately on launch
Dynasty layer — loads after first render (deferred)
History layer — loads on demand only
List Virtualization
Custom fixed-height virtualizer for the adventurer roster list. No FlashList. No Shopify dependencies.
Map Rendering
react-native-svg for the kingdom map. This is the one map-specific library approved for use.
Progressive Disclosure — Kingdom View
F, D, C tier adventurers collapse to aggregate counts on the kingdom view
Full detail only in city view and roster view
Tech Stack
Layer
Choice
Framework
React Native, Expo managed workflow with Dev Client
Navigation
Expo Router
State
Zustand — two stores (game state persisted via MMKV, UI state not persisted)
Monorepo
Turborepo
Unit/Property Tests
Vitest + fast-check
E2E
Cypress on Expo Web target
Types
TypeScript strict, project references, barrel exports
Linting
ESLint with TypeScript strict ruleset, no-any as error
Formatting
Prettier
Commits
Conventional commits, enforced via Husky + lint-staged
CI
GitHub Actions
Tick Pipe — System Order
advanceTime
processEconomy
processAdventurers
processQuests
processBuildings
processTransientVisitors
processHero
processRivals
processConclave
checkPrestigeConditions
checkLeaderPressure
checkForcedPrestige
processEventLog
Do not reorder systems without an ADR. Order matters — systems later in the pipe may read state written by earlier systems.
Game Design Reference
Timeline
Each run covers the last 50 active years of the founding hero's career
Guilds live 75–100 years total across up to 4 leaders
Minimum 2 leaders guaranteed per guild run
Early prestiges have forced prestige windows
Adventurer Legacy Tiers
F → E → D → C → B → A → S → SS → Legendary
F, E, D — never prestige-eligible
C through Legendary — prestige-eligible, escalating benefits and archetype options per tier
Higher tiers unlock more hero class options at prestige
Prestige Trigger
Prestige is triggered when a Legendary adventurer in your roster retires to found their own guild. Their adventurer career — class, stats, milestones — converts to the hero class for the next leader.
Run 1 only uses a starting class selection menu (no prestige conversion exists yet).
After prestige 10, requirements escalate: multiple high-tier adventurers must be available simultaneously, not just one.
Hero Classes
Class
Notes
Warblade
Combat focus
Wanderer
Exploration focus
Archmage
Magic focus
Diplomat
Relations focus
Bard
Influence focus
Each class has:
A passive ability shared by all heroes of that class
A career milestone active ability unlocked mid-run
A Legendary hero who has reached 2× SS rank gets Skill Borrow once per Conclave cycle
Guild Types
Combat / Merchant / Knowledge / Hospitality
Any class can run any guild type. Natural synergies exist but nothing is locked.
Prestige Relationship Tiers
Prestige Rank
Relationship Created
C
Affiliate
B
Branch
A
Chapter or fresh guild
S
HQ
SS
Independent Guild
Legendary
World event
World Awareness
Prestiges 1–2: World doesn't know the dynasty exists
Scales upward with prestige count
Prestige 16+: Mythic status
Master Mentor Ability
Unlocks at prestige 10
Costs 2 action points
Guides an adventurer's development toward specific milestones
Conclave
Occurs every 5 years as a personal milestone, not a competitive league
Measures dynasty growth across categories
Skill Borrow resets each Conclave cycle
Kingdom
Fiore scale — 5 regions, 15–20 locations, 1 capital
Regions: Heartlands (start), Coast (trade), Mountains (combat), Wilds (exploration), Capital Region (end game)
Multiple kingdoms: post-launch expansion only
Dynasty Meta-Progression
Persists across runs:
Permanent bonuses
World awareness tier
Unlocked hero classes and cities
Legacy guild history
Hall of Heroes
NPC guilds from previous runs populate the world. S and SS rank graduates are most likely to appear as rivals in future runs — with real history.
Economy — Design Incomplete
The following are flagged for a dedicated design pass. Do not hardcode values for these systems. Use balance.ts stubs and leave TODO comments.
Gold earning rates (per building level, active vs passive)
Gold costs (building upgrades, city expansion, recruitment, feasts, all expenditures)
Negative gold is intentional friction at high scale but needs guardrails
Magic Rewind safety mechanic:
In early prestiges, if the guild goes into negative gold, a magic rewind triggers — returning the player to the last critical decision point before the deficit
In later prestiges this safety feature does not exist; players face consequences directly
The exact prestige threshold for removing the safety net is a tuning decision, not yet locked
MCP Server
The MCP server is built early (not deferred) to enable easy tool testing and balance iteration.
Location: packages/mcp/
Tools (4):
Tool
Purpose
game_state_inspector
Inspect live game state during development
balance_config_reader
Read balance.ts constants
template_registry
Query static data templates (heroes, buildings, quests)
event_log_tail
Tail the event log
Validation: All tool inputs validated with Zod.
Google Play / Achievements
Integration is deferred until the core loop is complete and a Play Console account exists.
However, from day one:
Include AchievementKey type in shared types
Include achievementKey field on GameEvent as a stub (nullable)
Testing Standards
Tests live in __tests__/ folders alongside the code they test
Tests are written alongside features, not after
Property-based tests with fast-check for engine logic (tick, dispatch, system processors)
Unit tests for all system functions
E2E (Cypress) runs against Expo Web — only on PRs to main
CI gates (every push): lint, typecheck, unit tests, property tests
CI gates (PRs to main only): E2E
Git Workflow
main          ← stable releases only, never commit directly
develop       ← integration branch, never commit directly
feature/*     ← branch from develop
fix/*         ← branch from develop
chore/*       ← branch from develop
PRs go to develop. develop → main via PR when stable.

**Claude Code workflow rules — non-negotiable:**
- NEVER commit directly to Main or Dev. Always create a feature/fix/chore branch first.
- Every unit of work gets its own branch and PR. No batching unrelated changes.
- PRs must have clear titles and descriptions explaining decisions, not just listing changes.
- Commit early and often on the feature branch. Keep commits focused and conventional.
- Update session notes (`../claude-resources/sessions/idle-hero/current.md`) at the end of every session.
- Write a closed session log (`sNNN-slug.md`) at the end of every session.
- This is a portfolio project — every PR, commit message, and ADR should demonstrate professional engineering practices.

Commit Convention
feat:     new feature
fix:      bug fix
test:     adding or updating tests
chore:    tooling, config, dependencies
docs:     documentation only
refactor: no behavior change
perf:     performance improvement
PR Template
Every PR description includes:
What this PR does
Type of change
Testing checklist
Notes for reviewer
PR descriptions focus on decisions made and verification performed — not on what Claude Code generated.
Claude Code Disclosure
Claude Code is listed in the README under "Tools and Technologies" alongside other tools. It is not mentioned in individual PRs. Ownership is demonstrated through PR descriptions, ADRs, test coverage, and the ability to explain architecture decisions.
ADRs — Write on Day One
ADR
Title
001
Pure functions architecture
002
Monorepo with Turborepo
003
MMKV storage with layered loading
004
Vitest + fast-check property testing
005
MCP server built early
006
Game design foundation
007
Google Play integration deferred
008
Custom list virtualizer over FlashList
009
Progressive disclosure on kingdom view
010
Feature gating and entitlements architecture
011
Accessibility architecture
ADRs live in docs/adr/. Each ADR records: context, decision, consequences.
Deferred Design Decisions
The following are not yet decided. Do not implement them until a design conversation closes them.
Branch merging conditions — one hero upgrading to take over two locations. Deferred until core systems are stable.
Hero ability system scope — Option 3: whether all leaders share one hero ability system or each leader has their own. Must be decided before building the hero system.
NPC guild minimum tenure numbers — principle is locked (NPC guilds have minimum lifespans), specific numbers need tuning.
Development dashboard — revisit after core systems are built.
Detox mobile E2E — revisit if a Mac becomes available.
What "Done" Means
A feature is done when:
[ ] Engine logic is pure functions with no side effects
[ ] All numeric constants are in balance.ts
[ ] Tests are written (unit + property where applicable)
[ ] Types are in packages/shared with barrel exports
[ ] CI passes (lint, typecheck, unit, property)
[ ] PR description explains the decisions, not the code generation
Last updated: project kickoff. Update this file when architecture decisions change — do not let it drift from reality.
