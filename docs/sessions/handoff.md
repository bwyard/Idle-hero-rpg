# Handoff Document — Retired Hero's Guild

> Generated: 2026-03-16 | Branch: Main (clean) | For: Fresh Claude Code Session

---

## 1. Must Read First

**Before touching any code, read `CLAUDE.md` in full.** It is the authoritative 270-line project briefing covering non-negotiable architecture rules, game design reference, tech stack, tick pipe order, ADR index, and deferred decisions.

---

## 2. Project Overview

**Retired Hero's Guild** is a mobile idle clicker tycoon RPG built with React Native + Expo. The player is a retired legendary adventurer who founds a guild and builds it into a dynasty empire. No forced story ending — the goal is becoming the greatest guild in the world.

- **Platform:** Android primary, iOS future, Expo Web for E2E testing only
- **Purpose:** Portfolio project targeting Staff/Principal SDET roles
- **Dev machine:** Windows

---

## 3. Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.76.7, Expo 52 (managed + Dev Client) |
| Navigation | Expo Router 4 |
| State | Zustand 5 — `gameStore` (persisted) + `uiStore` (ephemeral) |
| Persistence | react-native-mmkv 3.1 with custom Zustand adapter |
| Monorepo | Turborepo 2 |
| Unit/Property Tests | Vitest 2 + fast-check 3.19 |
| E2E Tests | Cypress on Expo Web |
| Types | TypeScript 5.4 strict mode |
| Lint | ESLint flat config, `@typescript-eslint` strict — `no-any` is an **error** |
| Formatting | Prettier 3.2 |
| Commits | Conventional commits via Husky + commitlint |
| CI | GitHub Actions |
| MCP Server | `@modelcontextprotocol/sdk` 1.0 + Zod 3.22 |

---

## 4. Repository Structure

```
/
├── apps/game/src/
│   ├── data/balance.ts          # ALL numeric constants — never hardcode magic numbers
│   ├── engine/
│   │   ├── tick.ts              # Core game loop: 12-system pipeline
│   │   ├── pipe.ts              # pipe(value, ...fns) utility
│   │   └── dispatch.ts          # dispatch(state, action): GameState — pure
│   ├── systems/                 # 12 pure system processors (tick order is load-bearing)
│   ├── stores/
│   │   ├── gameStore.ts         # Zustand + MMKV persistence
│   │   ├── uiStore.ts           # UI-only state, not persisted
│   │   └── initialState.ts      # Initial GameState factory
│   ├── screens/                 # Expo Router screens
│   └── components/              # React components
├── packages/
│   ├── shared/src/types/        # All shared TypeScript types (barrel: index.ts)
│   └── mcp/src/                 # MCP dev server (4 tools)
├── e2e/                         # Cypress E2E
├── docs/
│   ├── adr/                     # 11 Architecture Decision Records
│   ├── architecture/            # engine.md, state.md, mcp.md
│   ├── design/                  # economy, hero classes, prestige, skill system
│   ├── decisions.md             # Master decisions + session tracking
│   └── sessions/                # This file + current-sprint.md
├── CLAUDE.md                    # Authoritative briefing — READ FIRST
└── README.md                    # Public overview
```

---

## 5. Architecture Rules (Non-Negotiable)

1. **Pure functions everywhere** — `tick`, `dispatch`, and all 12 system processors take state in, return state out. No mutations, no side effects.
2. **`balance.ts` is the single source of truth** for all numeric constants. Never hardcode magic numbers.
3. **Tick system order is load-bearing.** Do not reorder without creating an ADR.
4. **`no-any` is a lint error.** TypeScript strict mode throughout.
5. **Conventional commits enforced** via Husky. Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `perf`. Subject must be lowercase/kebab-case.

---

## 6. Current Git State

| Item | Value |
|------|-------|
| Current branch | `Main` |
| Status | Clean — no uncommitted changes |
| Remote branches | `Dev`, `Main`, `claude/interface-first-pattern-PhKCs`, `claude/mcp-server-tools-PhKCs`, `claude/process-update-PhKCs` |

### Recent Commits
```
be44109 docs: add ADR 011 — accessibility architecture
f7d8667 chore: add package-lock.json
125e75a test: add dispatch and initialState tests, fix react version
276cdef docs: clarify Shadow and Paladin as possible future hero classes
720f1e1 docs: lock prestige system design
3c5b0c4 docs: build pointer file targets from decisions.md
df741bb docs: reformat decisions.md as proper markdown
87345dc docs: add decisions and session tracking document
5b7e43e chore: set up full monorepo project structure
```

---

## 7. Incomplete / In-Progress Work

These are the systems with stub `TODO` implementations:

### High Priority
| System | File | Status |
|--------|------|--------|
| MMKV persistence layer | `stores/gameStore.ts` | Stubs — three-layer loading not implemented |
| State versioning & migrations | `stores/gameStore.ts` | Not started |
| Economy system | `data/balance.ts` | All gold values are stubs pending design pass |

### System TODOs (12 systems, partially stubbed)
| System File | What's Missing |
|-------------|----------------|
| `processBuildings.ts` | Passive income tick, upgrade progress, unlock conditions by region |
| `checkLeaderPressure.ts` | Age/career pressure tracking, event log emission |
| `processEventLog.ts` | Event collection, log append, max-length trimming |
| `checkPrestigeConditions.ts` | Prestige readiness check, escalated multi-adventurer check (prestige 10+), `flags.prestigeAvailable` |
| `checkForcedPrestige.ts` | Forced prestige window detection and trigger |
| `processConclave.ts` | Tick-to-years conversion, dynasty growth measurement, Skill Borrow reset |
| `processQuests.ts` | Quest tick advancement |
| `gameStore.ts` | Deferred dynasty meta-progression load |

### Deferred Design Decisions (from CLAUDE.md)
- Branch merging conditions (hero upgrading to take over two locations)
- Hero ability system scope (Option 3: per-leader vs. shared)
- NPC guild minimum tenure numbers
- Development dashboard (revisit after core systems built)
- Detox mobile E2E (revisit if Mac available)
- Magic Rewind safety prestige threshold (placeholder at prestige 5)

---

## 8. Running the Project

```bash
# Install dependencies
npm install

# Start Expo dev server
npm run dev

# Lint
npm run lint

# Typecheck
npm run typecheck

# Unit + property tests
npm run test:unit

# E2E (requires Expo Web build + server on :8081)
npm run test:e2e

# Build all packages
npm run build
```

---

## 9. CI Pipeline

GitHub Actions runs on every push:
1. **Lint** — `npm run lint`
2. **Typecheck** — `npm run typecheck`
3. **Unit + Property Tests** — `npm run test:unit` (coverage artifact uploaded)
4. **E2E** (PR to `main`/`develop` only) — Expo Web build → serve on 8081 → Cypress

---

## 10. Codebase Stats

| Metric | Count |
|--------|-------|
| TypeScript files | 42 |
| Lines of code | ~962 |
| Test files | 5 (~157 lines) |
| ADRs | 11 |
| System processors | 12 |
| Shared type domains | 8 |
| MCP tools | 4 |
| TODO comments | 21 |

---

## 11. Recommended Starting Points

If picking up active development:

1. Read `CLAUDE.md` fully
2. Check `docs/sessions/current-sprint.md` for last session's focus
3. Review `docs/decisions.md` for recent decisions
4. The most impactful next system to implement is **MMKV persistence** (`stores/gameStore.ts`) — it unlocks save/load and makes the game testable end-to-end
5. After persistence: **economy constants** in `balance.ts` to unblock the building/quest systems
