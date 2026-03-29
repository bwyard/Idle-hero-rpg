# ADR 012 — Temporal Architecture

## Status
Accepted

## Context
The Retired Hero's Guild is an idle RPG where history is the product. Heroes
accumulate careers, retire, found dynasties, and prestige into new runs. The
meaning of a hero's level 50 achievement is inseparable from the journey that
built it. Overwriting history with mutable state doesn't just lose data — it
destroys the meaning of the game.

The existing engine (Phases 0–3) is pure functional: `tick` and `dispatch` are
side-effect-free functions that transform `GameState` snapshots. This is a
strong foundation, but the snapshot model treats materialised state as ground
truth. Events exist in the log but are informational — they cannot reconstruct
the game state.

The Temporal Architecture formalises what the game already needs: identity is a
causal chain, not a mutable object. A retired hero is not a deleted record —
they are a causal chain that reached the `HERO_RETIRED` event. The guild's
current state is causally downstream of every hero who ever served it.

## Decision
Adopt the Temporal Architecture incrementally, starting with Phase 4 (Prestige
& Hero System). The four primitives — Time, Causality, Information, Context —
guide all new system design.

### Migration strategy

**Immediate (this ADR):**
- Enrich `GameEvent` with a `causeId` field linking events to their causal parent
- Add typed event discriminated unions alongside the existing string-type events
- Document temporal principles in `docs/architecture/temporal.md`

**Phase 4 (Prestige & Hero):**
- Build the prestige system event-sourced from day one: prestige is a causal
  branch, not a state reset
- Hero identity is a causal chain — derive hero state from event projections
- Dynasty meta-progression derives from the full cross-run event history

**Phase 5+ (incremental migration):**
- Existing systems (economy, adventurers, quests, buildings) migrate to richer
  events incrementally — each system's events become sufficient to reconstruct
  its state slice
- Zustand store transitions toward materialised view over event log
- `store.events` becomes the source of truth; derived fields become computed
  projections

### What does NOT change
- The pure functional engine remains pure functional
- The tick pipeline order remains load-bearing
- `Record<string, T>` keyed collections remain the lookup pattern
- `balance.ts` remains the single source for numeric constants
- The three-layer loading strategy (active run, dynasty, history) remains

### The four primitives applied to IHRPG

| Primitive | Current (Phase 0–3) | Target (Phase 4+) |
|---|---|---|
| **Time** | Game tick as temporal coordinate ✓ | No change — already correct |
| **Causality** | Events have `tick` but no parent link | Events carry `causeId` linking to parent event |
| **Information** | Systems share mutable state snapshots | Systems share events; each projects its own view |
| **Context** | Single materialised `GameState` | Multiple projections (player view, achievement view, prestige view) over same log |

## Consequences

### Positive
- Hero history becomes a first-class queryable structure, not a UI afterthought
- Prestige preserves pre-prestige history — prestige bonuses derive from it
- Offline progress is a deterministic causal fold — exact, not estimated
- Achievement system, dynasty system, and player view are all projections of the
  same event log — no divergent state
- Debugging and replay become trivial: replay the event log, get the same state

### Negative
- Incremental migration means two patterns coexist temporarily (snapshot ground
  truth for legacy systems, event-sourced for new systems)
- Event log storage grows — will need snapshot + delta strategy for persistence
- Projection functions must be performant — memoisation and indexing required
  for large event logs

### Risks
- Over-engineering: not every system needs full event sourcing. Economy income
  per tick does not need a causal chain — a running total is fine. Apply the
  architecture where history matters (heroes, prestige, dynasty, achievements).
- Performance: deriving state from events on every render is expensive. Use
  materialised snapshots as caches, recompute only on event append.

## Related
- ADR-001: Pure functions architecture (foundation this builds on)
- ADR-003: MMKV layered loading (persistence strategy for event logs)
- `docs/architecture/temporal.md`: Full temporal architecture reference
- `docs/architecture/engine.md`: Tick pipeline documentation
