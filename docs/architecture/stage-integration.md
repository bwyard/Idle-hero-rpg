# Stage Integration Architecture

**ADR:** 012 (Temporal Architecture), ADR-005 (MCP built early)
**Status:** Wiring in progress — Phase 4
**Last updated:** 2026-03-28

---

## How Stage and IHRPG Relate

Stage provides game system primitives. IHRPG consumes them as a domain-specific
idle RPG. The idle-hero engine wraps Stage functions with guild/adventurer/
prestige domain concepts while preserving Stage's pure functional composition.

```
PRIME (math)  →  STAGE (game systems)  →  IHRPG (domain game)
  prime-random       stage-events             tick pipe
  prime-interp       stage-progression        dispatch
                     stage-economy            Zustand store
                     stage-quest              React Native UI
                     stage-combat
                     stage-skills
                     stage-time
                     stage-loop
```

---

## Current Usage (as of Phase 4)

| Package | Functions Used | Where |
|---|---|---|
| `prime-random` | `prngRangeInt`, `prngNext` | dispatch, generateQuests, processTransientVisitors, processRivals |
| `stage-economy` | `canAffordGold`, `spendGold`, `addGold`, `calcUpgradeCost`, `calcUpgradeDuration` | dispatch |
| `stage-time` | `calendarTick` | advanceTime |

---

## Wiring Plan — What Goes Where

### stage-events → Temporal Architecture backbone

Stage's `EventLog<T>` with append-only events and typed reducers is the
natural implementation of ADR-012's causal event log. Replace the manual
`pendingEvents → eventLog` pattern with Stage's event system.

```typescript
// Current (manual)
pendingEvents: [...state.pendingEvents, { id, tick, type, message, causeId }]

// Target (stage-events)
import { appendEvent, eventsOfKind, eventsSince } from '@stage/stage-events'

// Append via stage
const log = appendEvent(state.eventLog, {
  kind: 'guild:recruit',
  tick: state.time.ticksElapsed,
  source: advId,
  causeId: null,
})

// Query via stage reducers
const questsCompleted = eventsOfKind(log, 'quest:completed').length
const xpSincePrestige = totalXpGained(log, heroId, prestigeTick)
```

**Integration point:** `processEventLog` system (system 13) becomes the
bridge — collects domain events, maps them to Stage event kinds, appends
to the Stage-managed log.

### stage-progression → processAdventurers + prestige flow

```typescript
import { addXp, xpToLevel, dynastyPrestige, prestigeReset } from '@stage/stage-progression'

// Adventurer XP gain (replaces manual XP thresholds in processAdventurers)
const { state: progState, levelsGained, gains } = addXp(advProgression, xpAmount, tierXpTable)

// Prestige (replaces manual prestige reset)
const dynastyState = dynastyPrestige(currentDynasty, {
  heroClass: retiringAdventurer.heroClass,
  tier: retiringAdventurer.tier,
  legacySkills: deriveLegacySkills(eventLog),
})
const resetState = prestigeReset(progression, dynastyState.bonuses)
```

**Integration point:** `processAdventurers` delegates XP calculations to
stage-progression. The tier-up thresholds in `balance.ts` map to stage's
XP table format. `dynastyPrestige` handles the prestige transition.

### stage-quest → processQuests + generateQuests

```typescript
import { questInit, questBegin, questTick, questComplete } from '@stage/stage-quest'

// Quest progression (replaces manual ticksRemaining countdown)
const { state: questState, completed } = questTick(currentQuestState)

// Quest completion with rewards
for (const questId of completed) {
  const result = questComplete(questState, questId)
  // result feeds into stage-events and stage-progression
}
```

**Integration point:** `processQuests` delegates tick advancement to
stage-quest. Quest templates map to stage's quest DAG format. Completion
events feed back into the event log.

### stage-combat → quest combat resolution

```typescript
import { combatInit, combatHit, combatTick } from '@stage/stage-combat'

// When a combat quest resolves
const combat = combatInit([adventurerCombatant, questEnemyCombatant])
const { state: resolved, completed } = combatTick(combat)
// Combat events → stage-events log
```

**Integration point:** Quest completion for combat-type quests runs a
stage-combat resolution. Results determine quest success/failure and
XP rewards.

### stage-skills → processHero abilities

```typescript
import { skillInit, learnSkill, useSkill, skillTick, activePassives } from '@stage/stage-skills'

// Hero passive abilities (replaces HeroAbilityImpl stub)
const passives = activePassives(heroSkillState)
// Apply passive effects to state

// Active ability use (costs AP)
const { state: skillState, effects } = useSkill(heroSkillState, abilityId)
```

**Integration point:** `processHero` delegates skill cooldown tracking
and passive effect application to stage-skills. The hero class ability
templates map to stage's skill template format.

### stage-loop → offline progress

```typescript
import { offlineTicks } from '@stage/stage-loop'

// On app resume
const ticksToProcess = offlineTicks(lastTickMs, nowMs, TICK_INTERVAL_MS)
const finalState = Array.from({ length: ticksToProcess }).reduce(
  (s) => tick(s), currentState
)
```

**Integration point:** The game store's offline progress calculation
uses stage-loop's `offlineTicks` for precise tick count derivation.

### prime-random → upgrade all RNG call sites

```typescript
// Replace manual weighted tier picking
import { weightedChoice, prngChoose, prngShuffled } from '@prime/prime-random'

// Visitor tier selection (currently manual)
const [tierIdx, seed1] = weightedChoice(seed, tierWeights)

// Quest template selection (currently prngRangeInt)
const [template, seed2] = prngChoose(seed1, eligibleTemplates)

// Name shuffling
const [shuffled, seed3] = prngShuffled(seed2, namePool)
```

---

## Input for Stage DSL (stage-dsl)

Stage's Phase 7 plans a declarative DSL layer. Based on IHRPG's consumption
patterns, here's what the DSL needs to support:

### 1. Declarative System Definitions

```typescript
// What we WANT to write (DSL target)
const guildEconomy = defineSystem('economy', {
  income: {
    base: perTick(PLACEHOLDER_BASE_INCOME_PER_TICK),
    buildings: perBuildingLevel(PLACEHOLDER_INCOME_PER_BUILDING_LEVEL_PER_TICK),
  },
  upkeep: {
    adventurers: perAdventurer(PLACEHOLDER_UPKEEP_PER_ADVENTURER_PER_TICK),
  },
  actions: {
    recruit: { cost: PLACEHOLDER_RECRUIT_COST, overcapacity: multiply(1.5) },
    build: { cost: PLACEHOLDER_BUILD_COST },
    feast: { cost: PLACEHOLDER_FEAST_COST },
  },
})
```

### 2. Event Builder Syntax with Causal Threading

```typescript
// What we WANT to write
const recruitEvent = event('guild:recruit')
  .at(tick)
  .source(advId)
  .causedBy(playerAction)
  .data({ name, tier: 'F', archetype })

// Instead of manually constructing event objects every time
```

### 3. Progression Tables as Data

```typescript
// What we WANT to write
const adventurerProgression = progressionTable({
  tiers: ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'Legendary'],
  xpThresholds: [10, 25, 50, 100, 200, 400, 800, 1600],
  ambientXp: { F: 0.5, E: 0.4, D: 0.3, C: 0.2, B: 0.15, A: 0.1, S: 0.05, SS: 0.02, Legendary: 0 },
  prestigeEligible: from('C'),
})
```

### 4. Quest DAGs as Declarative Graphs

```typescript
// What we WANT to write
const questGraph = questDAG({
  patrol: { region: 'Heartlands', minTier: 'F', duration: days(8), reward: gold(50) },
  escort: { region: 'Coast', minTier: 'D', duration: days(12), reward: gold(120), requires: ['patrol'] },
  dungeon: { region: 'Mountains', minTier: 'B', duration: days(20), reward: gold(500), combat: true },
})
```

### 5. Prestige Rules as Condition Gates

```typescript
// What we WANT to write
const prestigeRules = prestigeGates({
  '1-3': { requires: adventurerAt('C+', 1) },
  '4-6': { requires: either(adventurerAt('B+', 1), adventurerAt('C+', 2)) },
  '7-9': { requires: either(adventurerAt('A+', 1), adventurerAt('B+', 2)) },
  '10-12': { requires: either(adventurerAt('S+', 1), adventurerAt('A+', 2), adventurerAt('B+', 3)) },
  '13-15': { requires: either(adventurerAt('SS+', 1), adventurerAt('S+', 2), adventurerAt('A+', 3)) },
  '16+': { requires: either(adventurerAt('Legendary', 1), adventurerAt('SS+', 2), adventurerAt('S+', 3), adventurerAt('A+', 4)) },
})
```

### 6. Functional Composition Requirements

The DSL must preserve these properties:

- **Pure functions only** — every DSL construct compiles to `(State) => State`
- **Seed threading** — RNG seed threads through all randomized operations
- **Event emission** — every state change can optionally emit to the event log
- **Causal linking** — events carry `causeId` for temporal architecture
- **Pipe-friendly** — DSL-defined systems compose via `pipe()` in tick order
- **Testable** — DSL definitions are data; tests run against the compiled functions
- **Serializable** — DSL definitions can be stored as JSON for MCP tooling

### 7. Score DSL Parallel

Score (audio) uses a declarative DSL for composition:
```
// Score pattern (conceptual)
voice("lead").note(C4, quarter).note(E4, eighth)
```

Stage DSL should follow the same builder pattern for game systems:
```
// Stage pattern (target)
system("economy").income(perTick(10)).upkeep(perUnit(2)).action("feast", cost(100))
```

Both are declarative, pure data, composable, and serializable. The game
equivalent of a musical score is a game ruleset — both describe what happens
over time without executing it.

---

## Composition Pattern — How IHRPG Pipes Stage Systems

```typescript
// The tick pipe composes stage systems via IHRPG's domain wrapper
export const tick = (state: GameState): GameState =>
  pipe(
    state,
    advanceTime,        // wraps stage-time.calendarTick
    processEconomy,     // wraps stage-economy + domain income/upkeep
    processAdventurers, // wraps stage-progression.addXp + tier advancement
    processQuests,      // wraps stage-quest.questTick + stage-combat for resolution
    processBuildings,   // wraps stage-economy.calcUpgradeCost/Duration
    processTransientVisitors, // uses prime-random.weightedChoice for spawning
    processHero,        // wraps stage-skills.skillTick + activePassives
    processRivals,      // uses prime-random for NPC guild behavior
    processConclave,    // wraps stage-events queries for dynasty metrics
    checkPrestigeConditions, // queries stage-events for prestige eligibility
    checkLeaderPressure,     // domain logic over adventurer tiers
    checkForcedPrestige,     // domain logic over prestige windows
    processEventLog,         // wraps stage-events.appendEvent for log commit
  )
```

Each system is a thin domain wrapper over Stage primitives. Stage handles
the math. IHRPG handles the meaning.

---

## Migration Strategy

1. **Wire stage-events first** — it's the glue; other systems emit to it
2. **Wire stage-progression** — adventurer XP is the most active system
3. **Wire prime-random upgrades** — `weightedChoice` replaces manual logic
4. **Wire stage-quest** — quest tick/completion delegation
5. **Wire stage-skills** — hero ability system
6. **Wire stage-combat** — quest combat resolution
7. **Wire stage-loop** — offline progress precision

Each wiring is one commit. Tests update to verify Stage functions are called
correctly. Existing behavior is preserved — Stage is an implementation detail,
not a behavior change.
