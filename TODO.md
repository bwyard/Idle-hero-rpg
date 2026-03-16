# Retired Hero's Guild — Project TODO

Prioritised task list. Add tasks here freely — big features, QoL improvements, research spikes, anything.
Keep tasks small enough to be actionable. Link to ADRs or decisions.md entries where relevant.

Priority tiers:
- **P0** — Blocks the core loop. Must be done before anything else in the milestone.
- **P1** — High value, next up after P0s clear.
- **P2** — Medium value, schedule when P1s are stable.
- **P3** — Nice to have / QoL. Do when there's headroom.

---

## P0 — Core Loop Blockers

- [ ] Implement `processEventLog` — collect `pendingEvents`, append to `eventLog`, clear pending, trim log to max length (prevent unbounded growth)
- [ ] Implement `advanceTime` tick→year conversion so all systems that read in-game years work correctly
- [ ] Implement `processEconomy` stubs once economy design pass is complete (see `balance.ts` TODO comments)
- [ ] Wire Zustand `loadActiveRun` to MMKV — active run state must load on launch before first render
- [ ] State migration runner — load version from save, run migrations in sequence before handing state to systems
- [ ] First playable screen — guild view that renders current `GameState` and advances on a timer

---

## P1 — High Priority

- [ ] **ID STRATEGY DECISION — live game objects** — Named slugs are settled for templates. Live objects (adventurers, visitors, quests, buildings, rivals) need a decision before recruitment is built.
  - Current state: `id: string` in all live types — format is unconstrained
  - Option A: **Prefixed nanoid** — `adv_<nanoid>`, `vis_<nanoid>`, `qst_<nanoid>` etc. Collision-free at scale, human-readable in logs/saves, no counter state needed, seeable for tests. 130-byte library. **Preferred.**
  - Option B: **`crypto.randomUUID()`** — zero deps, available in Hermes 0.74+/React Native 0.74+. Less readable in logs (full UUID vs 21-char nanoid). Harder to type-prefix without helper.
  - Option C: **Tick-scoped counters** — `adv_<tick>_<index>`. Deterministic and sortable but requires per-type counter in state; complex to migrate; brittle on save/load bugs.
  - Rationale for prefixes regardless of generator: at thousands of adventurers across a dynasty, untyped IDs make event logs and save files hard to debug. Prefix at creation site; `Record<string, T>` keeps O(1) lookup regardless.
  - Action: close the decision in `decisions.md`, add `nanoid` (or note `crypto.randomUUID`) to deps, write a `createId(prefix)` factory in `packages/shared/src/utils/id.ts`
- [ ] **DORM / TRANSIENT VISITOR SYSTEM** — Non-guild adventurers stopping at the guild house to seek services.
  - `TransientVisitor` type is defined in `packages/shared/src/types/adventurer.ts` ✓
  - `transientVisitors: Record<string, TransientVisitor>` is in `GameState` ✓
  - Service requests: `Quest | Training | Repair | Health | Lodging`
  - Each requires a corresponding building to fulfil (Training Grounds, Tavern, etc.)
  - If the required building doesn't exist or is at too low a level, the visitor cannot be helped — present UI hint to player about what to build
  - Visitors arrive at a rate tied to guild reputation and current city
  - Visitors expire after `expiresAtTick` if not engaged or held
  - Action: add `processTransientVisitors` system to the tick pipe (order TBD — likely after `processBuildings`, before `processHero`); requires a tick-pipe ADR update
- [ ] **OPPORTUNITY HOLD MECHANIC** — When a transient visitor appears, the player can put them on hold for X ticks to decide whether to build the requirements or expand.
  - `heldUntilTick: number | null` and `holdCount: number` fields are in `TransientVisitor` ✓
  - Hold duration is fixed per hold count (e.g. 20 ticks first hold, 10 ticks second hold, 5 ticks third) — use `balance.ts` constants, not hardcoded values
  - After all holds are exhausted or `heldUntilTick` elapses, `expiresAtTick` takes over
  - Player UI: show visitor card with "Hold" / "Engage" / "Dismiss" actions via dispatch
  - Action: add `HOLD_VISITOR`, `ENGAGE_VISITOR`, `DISMISS_VISITOR` to `GameAction` discriminated union; implement in `dispatch()`; add `VISITOR_HOLD_DURATIONS` array to `balance.ts`
- [ ] Implement `processAdventurers` — XP gain per tick, tier advancement (F→Legendary), retirement logic for Legendary tier
- [ ] Implement `checkPrestigeConditions` — detect Legendary retirement, set `flags.prestigeAvailable`
- [ ] Implement `checkForcedPrestige` — detect early-run forced prestige windows, trigger appropriately
- [ ] Wire MMKV dynasty layer — deferred load after first render (`loadDynastyLayer` in gameStore)
- [ ] Implement `processQuests` — tick advancement, completion, reward distribution, quest generation by region
- [ ] Implement `processBuildings` — passive income per tick (blocked on economy design), upgrade progress
- [ ] MCP `game_state_inspector` — when MMKV is wired, support reading a real exported state dump instead of only the dev fixture
- [ ] Kent Dodds testing trophy: add integration tests for `tick` pipeline (pipe all 12 systems, assert output shape) — currently only unit tests exist per system
- [ ] Functional React standards doc — establish component patterns before first screen is built: no class components, hooks only, `useMemo`/`useCallback` at actual bottlenecks (not speculatively), co-locate state with usage

---

## P2 — Medium Priority

- [ ] **NAME GENERATION AUDIT** — Investigate where adventurer, guild, and hero names will come from
  - Currently `initialState.ts` uses empty strings (`name: ''`) — no generator wired
  - No `faker` or other library is in use yet
  - Decision needed: build a curated fantasy name table (full control, no dep), use `@faker-js/faker` with a custom locale/seed, or a lightweight standalone generator
  - Curated tables are preferred for lore consistency (Fiore-scale world names should feel cohesive)
  - Action: open a design conversation, write a decision entry in `decisions.md`, implement chosen approach
  - Files to check when ready: `apps/game/src/stores/initialState.ts`, any future recruitment system code
- [ ] `processRivals` — rival NPC guild tick progression, S/SS graduate population, minimum tenure enforcement
- [ ] `processHero` — passive ability effects, action point regen, career milestone tracking
- [ ] `processConclave` — dynasty growth measurement, Skill Borrow reset, tick→year conversion (blocked on P0 tick conversion)
- [ ] **TEMPLATE REGISTRY SCALING** — Current registry is a dev shape fixture only. When authored game content grows (100+ quest variants, building upgrade trees, archetype skill tables), the MCP tool needs a real data pipeline.
  - Option A: Load from JSON files per template type (lazy, on first query). O(n) parse once, O(1) lookup after.
  - Option B: SQLite or similar for MCP-side querying with filter/sort/pagination. Adds complexity but handles 10k+ entries cleanly — worthwhile if content editors need to query across types.
  - Option C: Keep in-memory Record but load from a versioned game-data package rather than hardcoded source. Simplest to start.
  - At hundreds of templates: O(n) list-all is fine. At thousands: add pagination to the MCP tool response rather than returning unbounded JSON blobs.
  - Action: revisit when content design is far enough along to know true template counts. Do not prematurely optimise.
- [ ] **BIG O — TICK PIPE QUERY PATTERNS** — Systems that process collections in the tick pipe.
  - By-ID lookups: `Record<string, T>` is O(1) everywhere. Keep. ✓
  - Filtering within a tick system (e.g. "all adventurers in city X", "all quests of type Combat"): currently O(n) over the full collection. At hundreds of adventurers this is fine. At thousands this fires every tick.
  - **When to act**: if tick profiling shows filter scans are a hotspot, add secondary indexes to GameState: `adventurersByCity: Record<string, string[]>`, `questsByType: Record<string, string[]>`. O(1) group lookup + O(k) iteration where k = group size.
  - Secondary indexes must be kept in sync inside the tick pipe — adds correctness risk. Don't add until profiling proves it necessary.
  - Sorting (roster view, kingdom view aggregates): O(n log n) — unavoidable. Belongs in UI layer, not in tick. Do not sort inside tick systems.
  - Event log append: O(1) amortised with a bounded max-length trim. ✓
  - **Action**: add a performance profiling task before the first public build. Keep this note as the reference for what to index if profiling flags a hotspot.
- [ ] **BIG O — MCP TOOL OPERATIONS** — Current honest Big O for each tool:
  - `game_state_inspector`: O(1) section lookup ✓
  - `template_registry`: O(1) by-ID, O(n) list-all — n is bounded by authored template count ✓
  - `balance_config_reader`: O(n) line parse (unavoidable), O(n) keyword filter (unavoidable without inverted index — not worth it for a dev tool) ✓
  - `event_log_tail`: O(n) filter over log, O(k) slice where k = count — both unavoidable ✓
  - None of these are in the hot path. O(n) is acceptable for all MCP tools since they are called interactively by developers, not on every game tick.
- [ ] MCP `balance_config_reader` — cache parsed constants per file mtime so repeated calls don't re-read disk on every invocation
- [ ] MCP `event_log_tail` — support reading from a real MMKV dump when available (not just dev fixture)
- [ ] Set up GitHub Actions CI — lint, typecheck, unit, property tests on every push; E2E on PRs to Main only
- [ ] Add `fast-check` property tests for `tick` — arbitrary `GameState` in, shape invariants out (version preserved, ticksElapsed increases, no undefined collections)
- [ ] Add `fast-check` property tests for `dispatch` — arbitrary state + action, state shape invariants hold

---

## P3 — QoL / Low Priority

- [ ] PowerShell profile helpers — session load/update scripts for dev workflow on Windows
- [ ] Dev fixture tooling — script to export real MMKV state to `packages/mcp/dev-fixtures/gameState.json` for MCP testing
- [ ] Prettier config — confirm `.prettierrc` covers all file types including `.json` and `.md`
- [ ] VSCode workspace settings — ensure consistent formatting, TS project references, and Expo tooling work without manual config
- [ ] MCP tool: add `--watch` mode to `event_log_tail` for live tailing during dev sessions
- [ ] Review `processEconomy` negative gold guard rails — even before full economy design, define the minimum safety check so negative gold doesn't break invariants
- [ ] Document `pipe` utility — add a usage example in the file header for future contributors
- [ ] Audit `eslint.config.js` — confirm `no-any` is an error, not a warning, per CLAUDE.md
- [ ] Vite CJS deprecation warning in `apps/game` — `vitest.config.ts` loads via CJS because `apps/game/package.json` lacks `"type": "module"`. Adding it may break Expo/Metro. Investigate whether Expo SDK version in use supports `"type": "module"` at the package level; if not, try `vitest.config.mts` (explicit ESM extension) instead.

---

## Completed

- [x] Set up monorepo with Turborepo (ADR-002)
- [x] Scaffold all 12 system stubs with correct pure-function signatures
- [x] `pipe` utility implemented and tested
- [x] `dispatch` implemented and tested
- [x] `tick` wired through all 12 systems via `pipe`
- [x] Shared types defined: `GameState`, `Adventurer`, `Hero`, `Guild`, `City`, `Building`, `Quest`, `Dynasty`, `GameEvent`, `GameAction`
- [x] All ADRs 001–011 written
- [x] MCP server scaffolded with 4 tools (stubs → implemented)
- [x] MCP `balance_config_reader` — reads real `balance.ts`, functional reduce parser, O(n) single pass
- [x] MCP `game_state_inspector` — reads dev fixture, O(1) section lookup
- [x] MCP `template_registry` — dev shape fixture, O(1) ID lookup via Record; not a production data system
- [x] MCP `event_log_tail` — reads dev fixture event log, filter + slice
- [x] MCP tests: 30 tests across 4 tools (Kent Dodds trophy: integration-heavy, unit for pure parsers)
