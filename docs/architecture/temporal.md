# Temporal Architecture — Applied to Retired Hero's Guild

**ADR:** 012-temporal-architecture.md
**Status:** Adopted incrementally from Phase 4

---

## Why This Game Needs Temporal Architecture

Games about heroes accumulating history are the most natural demonstration that
identity is a causal chain, not a mutable object. A retired hero is meaningful
only because their active career is in the causal chain. A guild is meaningful
only because the heroes who built it are in the log.

The Retired Hero's Guild proves this intuitively: players understand that a
hero's level 50 achievement means more because of the journey. The temporal
architecture makes this intuition exact.

---

## The Four Primitives

### 1. Time — Game Tick as Temporal Coordinate

Every game event has a tick. The tick is not wall clock time. The game can run
in the background, be paused, be resumed, be replayed — because game time is
explicit and independent.

```typescript
// The tick is the game's time coordinate
type GameTick = number // monotonically increasing, never wall clock

// Every event carries its tick
type GuildEvent = {
  type: string
  tick: GameTick
  causeId: string | null // causal parent event ID
  data: unknown
}
```

The idle loop advances the tick. Real time determines how many ticks to advance —
it never IS the tick.

```typescript
// Elapsed ticks derived from real time delta, game time is explicit
const processOfflineProgress = (state: GameState, deltaMs: number): GameState => {
  const ticksElapsed = Math.floor(deltaMs / MS_PER_TICK)
  return Array.from({ length: ticksElapsed }).reduce(
    (s, _, i) => tick({ ...s, time: { ...s.time, ticksElapsed: s.time.ticksElapsed + 1 } }),
    state
  )
}
```

**Current status:** Already implemented. `advanceTime` system manages the tick
counter. Calendar derives from ticks (365 days/year, 4 seasons).

### 2. Causality — Every Guild Action Has a Parent

Heroes completing quests, earning gold, levelling up, retiring — each event
causally follows from prior events. The causal chain IS the hero's story.

```typescript
// Events link to their causal parent
interface CausalEvent extends GameEvent {
  readonly causeId: string | null // null = root event (e.g. game start, recruit)
}

// A hero's journey is the chain of events with their ID
const getHeroJourney = (events: readonly GameEvent[], heroId: string): GameEvent[] =>
  events.filter(e => 'heroId' in e && e.heroId === heroId)
```

**Current status:** Events have `tick` but no `causeId`. Phase 4 adds causal
linking. New events will carry `causeId` pointing to their parent event's `id`.

### 3. Information — Systems Share Events, Not Objects

The hero management system, the guild economy system, and the quest system share
events through the event log. Each system is a receiver function over the log.

```typescript
// CURRENT — systems share mutable state snapshots
const processEconomy = (state: GameState): GameState => {
  // reads state.guild.gold directly, writes back to it
}

// TARGET — systems project from events
const deriveGuildGold = (events: readonly GameEvent[]): number =>
  events
    .filter(e => e.type === 'GOLD_EARNED' || e.type === 'GOLD_SPENT')
    .reduce((total, e) => e.type === 'GOLD_EARNED' ? total + e.amount : total - e.amount, 0)
```

**Current status:** Systems operate on `GameState` snapshots. Migration to
event-derived projections happens incrementally. New Phase 4 systems (prestige,
dynasty) will be event-sourced from day one.

### 4. Context — Different Views Over the Same Guild History

The player sees one projection of the event log. The achievement system sees
another. The prestige system sees another. All are valid receiver functions
over the same causal log.

```typescript
// Player view — current run state
const derivePlayerView = (events: readonly GameEvent[]) => ({
  activeHeroes: deriveActiveHeroes(events),
  guildGold: deriveGuildGold(events),
  reputation: deriveReputation(events),
  activeQuests: deriveActiveQuests(events),
})

// Achievement view — lifetime aggregates
const deriveAchievements = (events: readonly GameEvent[]) => ({
  questsCompleted: events.filter(e => e.type === 'QUEST_COMPLETED').length,
  heroesRetired: events.filter(e => e.type === 'HERO_RETIRED').length,
  totalGold: events.filter(e => e.type === 'GOLD_EARNED').reduce((t, e) => t + e.amount, 0),
})

// Prestige view — projects only post-prestige events
const derivePostPrestigeState = (events: readonly GameEvent[]) => {
  const prestigeIdx = events.findLastIndex(e => e.type === 'PRESTIGE')
  return prestigeIdx === -1
    ? derivePlayerView(events)
    : derivePlayerView(events.slice(prestigeIdx))
}
```

**Current status:** Single materialised `GameState`. Phase 4 introduces
projection functions for prestige and dynasty views.

---

## Zustand as Materialised View

The Zustand store is a cache of derived state. The event log is the source of
truth.

**Current architecture (Phases 0–3):**
```
Zustand store → GameState (ground truth) → eventLog (informational)
```

**Target architecture (Phase 4+):**
```
Zustand store → events (ground truth) → materialised GameState (cache/projection)
```

The transition is incremental. New systems project from events. Legacy systems
continue reading materialised state. Both coexist during migration.

**Test:** If you can reconstruct the full game state from `store.events` alone,
the architecture is correct. If anything in the store cannot be derived from
events, it is being stored as mutable ground truth — a violation.

---

## Hero Identity as a Causal Chain

A hero is not an object with properties. A hero is a causal chain with a name.

```typescript
const deriveHero = (events: readonly GameEvent[], heroId: string) => ({
  id: heroId,
  name: events.find(e => e.heroId === heroId && e.type === 'HERO_RECRUITED')?.data.name,
  level: events.filter(e => e.heroId === heroId && e.type === 'LEVEL_UP').length + 1,
  questsCompleted: events.filter(e => e.heroId === heroId && e.type === 'QUEST_COMPLETED').length,
  status: deriveHeroStatus(events, heroId),
  history: events.filter(e => e.heroId === heroId),
})
```

A retired hero is not a deleted object. They are a causal chain that has
reached the `HERO_RETIRED` event. Their contribution to the guild remains in
the log. The guild's current state is causally downstream of every hero who
ever served it.

---

## Prestige as Causal Branching

Prestige is not a reset — it is a new causal layer.

```typescript
const prestige = (state: GameState, tick: GameTick): GameState => {
  const prestigeEvent: GameEvent = {
    id: createId('evt'),
    type: 'PRESTIGE',
    tick,
    causeId: state.eventLog[state.eventLog.length - 1]?.id ?? null,
    data: {
      totalGoldEarned: deriveGuildGold(state.eventLog),
      questsCompleted: state.eventLog.filter(e => e.type === 'QUEST_COMPLETED').length,
      prestigeBonus: calculatePrestigeBonus(state.eventLog),
    },
  }

  return {
    ...state,
    eventLog: [...state.eventLog, prestigeEvent],
    // Pre-prestige events are NOT deleted — they are causally prior
    // Post-prestige state derives from events after the PRESTIGE marker
  }
}
```

Pre-prestige history is never deleted. The prestige bonus derives from that
history. The fresh start is a new temporal thread causally downstream of
everything before.

---

## The Idle Loop as a Causal Fold

Offline progress is not an estimate — it is exact.

```typescript
const processOfflineProgress = (state: GameState, offlineTicks: number): GameState =>
  Array.from({ length: offlineTicks }).reduce(
    (s, _, i) => processTick(s, s.time.ticksElapsed + i),
    state
  )
```

Same state + same delta = same result. The player can never be cheated by the
offline calculation because it is a pure function.

**Current status:** Already implemented. The tick pipeline is deterministic.
`rngSeed` threads forward through `prngNext`, ensuring identical replay.

---

## React Components as Pure Receiver Functions

```typescript
// Components derive all game data from the store's event log
// Local useState for UI state only (modal open, input focus, animation state)
// Never local useState for game data

const HeroCard = ({ heroId }: { heroId: string }) => {
  const hero = useGameStore(state => deriveHero(state.events, heroId))
  return <View>...</View>
}
```

**Current status:** Components read from `useGameStore(s => s.state)`. Phase 4+
components will read from projection functions.

---

## Side Effects — Platform-Specific Concerns

| Concern | Approach |
|---|---|
| Timer drift | Timer measures real-time delta only. Game ticks derived from delta. Never use timer count as game tick. |
| Background execution | Record timestamp on background. On resume, calculate elapsed real time → derive ticks → fold as batch. |
| Persistence (MMKV) | Store event log, not derived state. For large logs: snapshot + events-since-snapshot. Snapshot is cache, not truth. |
| Push notifications | Project future state at target tick. Schedule notification. Deterministic. |

---

## Decision Rules

When adding a game feature:
1. What event does this introduce to the log?
2. What state is derived from that event?
3. What existing events does it causally follow?

When a hero gains something:
- Append an event — never mutate stored values
- The hero's new state derives from the appended event

When implementing offline progress:
- Real time → tick delta → fold over ticks
- Same delta + same prior state = same result

When using Zustand:
- Append events — never set derived values directly
- If calling `set({ gold: newGold })` without an event that caused the change,
  something is wrong

When writing a React component:
- Derive all game data from the store's event log
- Local `useState` for UI state only

**One sentence for when you are unsure:**
If you can't answer "what event caused this state change and when did it
happen," the architecture has lost information it needed to keep.

---

## Migration Path

### Already aligned (Phases 0–3)
- Pure functional engine — no mutations, no side effects ✓
- Time as explicit game tick ✓
- Deterministic RNG seed ✓
- Events appended to log on every action and tick ✓

### Phase 4 — Prestige & Hero System (event-sourced from day one)
- `GameEvent` gains `causeId` field for causal linking
- Prestige system built as causal branch over event log
- Hero identity derived from event chain
- Dynasty meta-progression projects from cross-run event history

### Phase 5+ — Incremental migration
- Existing systems enrich events to capture full state-change data
- Projection functions replace direct state reads where history matters
- Zustand store transitions: `events` becomes source of truth
- Materialised `GameState` becomes a computed cache

### Systems that DO NOT need full event sourcing
- Economy income per tick — running total is sufficient
- Building upgrade progress — countdown timer, not historical
- Timer/calendar — pure derivation from tick count

Apply the architecture where history matters: heroes, prestige, dynasty,
achievements, rivalries, world awareness.
