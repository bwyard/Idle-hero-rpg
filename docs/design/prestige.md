# Prestige — Design Reference

**Status:** LOCKED — all core decisions closed 2026-03-10

---

## Core Philosophy

**Prestige is guild master succession — you choose when to pass the torch.**

You are always the guild master. You never retire to found another guild. When the
dynasty is ready, you hand leadership to a qualified member and that person becomes
the next chapter in the dynasty's story. The class they start with is derived from
their adventurer career — their combat style, their magic school, their milestones.
From run 2 onward the player never picks a class from a menu. The class is earned
through play.

**The player decides when to prestige.**

Minimum requirement is a C-tier or higher adventurer ready to take over. Higher tier
successor = better dynasty bonus at handoff. Prestige early with a C-tier and you get
more generations with smaller bonuses. Wait for a Legendary and you get fewer generations
with maximum bonuses. Both are valid strategies.

**The guild continues after you prestige.**

Prestiging does not end the guild. The guild lives on under new leadership. Each active
play run lasts 50 years maximum. The guild itself lives 75–100 years total with up to
4 leaders across its lifespan. Every guild in the world has a minimum of 2 leaders in
its history — guaranteed.

**Each run is a chapter. The dynasty is the story. The demon king is the destination.**

Previous guilds persist in the world as living NPC entities. They appear in future runs
as rivals with real history. The world remembers what you built. Every generation moves
the dynasty closer to being able to face the demon king.

---

## Starting Context

The game opens with the founding hero surviving the original demon king catastrophe —
the battle that nearly wiped out every guild in the world. The player experiences that
moment briefly before transitioning to the guild's founding. Run 1 uses a class selection
menu because there is no prior adventurer career to convert from. The full story of what
happened in that battle is revealed through play — specifically through the late-game
Survivor's Mark quest line and the demon king quest chain.

---

## The 8 Adventurer Legacy Tiers

Adventurers accumulate a Legacy Track separate from regular XP and level.
It fills based on: years in the guild, quests completed, mentor sessions received,
major achievements, and loyalty consistency.

| Tier      | Prestige Eligible        | Visibility in Guild                                           |
|-----------|--------------------------|---------------------------------------------------------------|
| F         | No                       | Standard member, no special presence                          |
| E         | No                       | Standard member, no special presence                          |
| D         | No                       | Competent member, no special presence                         |
| C         | Yes — minimum viable     | Gold nameplate on room door, others give them space           |
| B         | Yes — solid              | Named room, junior adventurers ask them questions             |
| A         | Yes — strong             | Seat at the guild hall table, quest givers request them       |
| S         | Yes — exceptional        | Own office or training space, rival guilds have made offers   |
| SS        | Yes — legendary          | Name on guild hall exterior, turning down kingdom recognition |
| Legendary | Yes — world event        | Portrait on guild hall wall while still alive                 |

F, E, and D are the workforce — the backbone of guild operations. Most adventurers
live and retire here. That is realistic and intentional.

C through Legendary are the prestige pool. C is rare enough to feel meaningful.
Legendary is rare enough to feel special.

---

## Prestige Benefits and Hero Class Options

Higher prestige tier unlocks more hero class options at conversion. The base conversion
table determines which archetypes are offered. Higher rank unlocks more options from
that table.

**Example — Mira, a Shadowblade with high stealth and moderate diplomacy:**

| Tier Reached | Options Available |
|---|---|
| C Class | 1 option: Wanderer (natural class) |
| B Class | 2 options: Wanderer, Diplomat (diplomacy stat qualifies) |
| A Class | 3 options: Wanderer, Diplomat, Warblade (combat experience unlocks) |
| S Class | 4 options: Wanderer, Diplomat, Warblade, Archmage (magic quests completed) |
| SS Class | All options available |
| Legendary | Full archetype freedom + unique named dynasty trait |

The player sees exactly why each option is available. Choices feel earned, not arbitrary.
This creates mid-run goals — develop Mira's diplomacy deliberately to unlock Diplomat
at B Class rather than waiting for SS Class.

---

## Adventurer Class to Hero Class Conversion

| Adventurer Background                  | Hero Class                                       |
|----------------------------------------|--------------------------------------------------|
| Berserker, Guardian, Warlord, Duelist  | Warblade                                         |
| Shadowblade, Archer, Monk              | Wanderer                                         |
| Any class with dominant magic school   | Archmage                                         |
| Any class with dominant diplomacy stat | Diplomat                                         |
| High stats across everything, no dominant | Bard                                          |
| Alchemist Fighter                      | Diplomat or Archmage                             |
| Beastmaster                            | Wanderer or Diplomat                             |
| Spellblade                             | Archmage (high magic) or Warblade (low magic)    |

Stats and magic school modify conversion. A Guardian with dominant diplomacy becomes a
Diplomat, not a Warblade. The system is responsive to how you actually played.

---

## Hero Classes and Abilities

Class determines the ability pool. Individual hero gets abilities from that pool based
on their adventurer career. Two heroes of the same class will not be identical.

### Warblade
- **Passive (all Warblades):** Combat Veteran — passive combat quest bonus
- **Career milestone active (one of):**
  - Berserker background → Rage Burst (cooldown, temporary quest power spike)
  - Guardian background → Iron Wall (cooldown, protect adventurers from injury)
  - Warlord background → Rally (cooldown, morale boost to whole roster)

### Wanderer
- **Passive (all Wanderers):** Pathfinder — passive exploration bonus
- **Career milestone active (one of):**
  - Shadowblade background → Ghost Step (cooldown, stealth quest auto-success)
  - Archer background → Eagle Eye (passive, reveals rival intel)
  - Monk background → Inner Peace (cooldown, remove negative mood from adventurers)

### Archmage
- **Passive (all Archmages):** Arcane Knowledge — passive knowledge resource boost
- **Career milestone active (one of):**
  - Destruction school → Mana Surge (cooldown, massive quest power burst)
  - Restoration school → Mend (cooldown, instant injury recovery)
  - Divination school → Foresight (passive, see quest outcomes before assigning)

### Diplomat
- **Passive (all Diplomats):** Silver Tongue — passive expansion cost reduction
- **Career milestone active (one of):**
  - High diplomacy quests → Alliance (cooldown, temporary rival guild cooperation)
  - High loyalty average → Beloved Leader (passive, loyalty decay halved)
  - Multi-city career → Network (passive, resource sharing between locations)

### Bard
- **Passive (all Bards):** Legend Speaks — passive reputation gain boosted
- **Career milestone active (one of):**
  - Varied quest history → Jack of All Trades (cooldown, temporary boost to any stat)
  - High mentor count → Inspire (cooldown, XP burst to entire roster)
  - Long tenure → Living Legend (passive, top tier adventurers arrive faster)

### Special — Legendary Hero with Two SS Class Adventurers

When a Legendary adventurer prestige has two SS Class adventurers in their guild
simultaneously they unlock **Skill Borrow**:

- Once per Conclave cycle
- Temporarily adopt one ability from either SS Class adventurer's hero class pool
- Duration: one in-game season
- Cooldown: resets at next Conclave
- Cannot borrow the same ability twice in a row
- Whether borrowed skills can become permanent = tuning decision, code to support either

---

## Escalating Prestige Requirements

| Prestige Count | Minimum Requirement                                         |
|----------------|-------------------------------------------------------------|
| 1–3            | 1 adventurer at C Class or above                            |
| 4–6            | 1 at B Class OR 2 at C Class simultaneously                 |
| 7–9            | 1 at A Class OR 2 at B Class simultaneously                 |
| 10–12          | 1 at S Class OR 2 at A Class OR 3 at B Class simultaneously |
| 13–15          | 1 at SS Class OR 2 at S Class OR 3 at A Class simultaneously |
| 16+            | 1 Legendary OR 2 SS OR 3 S OR 4 A simultaneously           |

The Master Mentor ability unlocks at prestige 10 — exactly when deliberate multi-candidate
development becomes necessary.

Constant: `PRESTIGE_ESCALATION_THRESHOLD` in `balance.ts`

---

## Forced Prestige Windows

Early prestiges have forced transition deadlines to teach the rhythm and guarantee a
minimum of 2 leaders per guild. The forced window is a tutorial constraint, not a
punishment. By prestige 7 the player understands the system.

| Prestige | Must Transition By |
|----------|--------------------|
| 1        | Year 25            |
| 2        | Year 30            |
| 3        | Year 35            |
| 4        | Year 40            |
| 5–6      | Year 45            |
| 7+       | No forced transition — full player control |

---

## Involuntary Leader Replacement

If a higher tier adventurer emerges while the current leader is still active, pressure
builds to transition. Rules scale with prestige count.

| Prestige Count | Replacement Behavior |
|----------------|----------------------|
| 1–3            | No involuntary replacement. Full player control. Learning period. |
| 4–6            | Soft pressure only. Event log warns. No mechanical consequence. |
| 7–9            | Moderate pressure. If higher tier exists and leader served 20+ years, morale declines slightly. |
| 10–12          | Real pressure. SS or Legendary vs B Class or below causes significant morale impact. Top adventurers may leave. |
| 13+            | Hard involuntary replacement possible. If Legendary exists and leader is C Class or below, transition happens after warning period. |

### The C Replaced by A Scenario

If a C Class leader has an A Class adventurer emerge, the C Class leader can:

1. **Voluntarily step aside** — graceful transition, full legacy benefits preserved
2. **Hold on** — morale cost, some adventurers leave, eventually transitions with reduced benefits
3. **Grow into it** — accelerate their own Legacy Track

---

## Guild Relationship Tiers by Prestige

The relationship created with the founding guild depends on the adventurer's tier at the
time of retirement.

| Adventurer Tier at Retirement | Relationship Created |
|-------------------------------|----------------------|
| C                             | Affiliate            |
| B                             | Branch               |
| A                             | Chapter or fresh guild |
| S                             | HQ                   |
| SS                            | Independent Guild    |
| Legendary                     | World event          |

---

## World Awareness

Dynasty presence in the world scales with prestige count.

| Prestige Count | Status                        |
|----------------|-------------------------------|
| 1–2            | World unaware of dynasty      |
| 3–15           | Scales upward with prestige   |
| 16+            | Mythic status                 |

Constant: `MYTHIC_STATUS_PRESTIGE` in `balance.ts`

---

## Tutorial Prestige Sequence

The early prestige sequence doubles as narrative onboarding. Exact structure is not
yet locked — current ideas in rough order: Branch → Affiliate → merge → fresh guild.
Functional design for this sequence is deferred until core systems are stable.
Do not implement tutorial flow logic until this is locked.

---

## Prestige Milestone Unlocks

A meaningful unlock at every prestige. These are design targets — exact
implementation order may shift but the unlock intent is locked.

| Prestige | WorldAwareness | Idle Cap | Major Unlock |
|----------|---------------|----------|--------------|
| 0 | Hidden | 7 days | Guild founded — basic ops, F/E/D roster |
| 1 | Hidden→Local | 30 days | Hall of Heroes opens, first dynasty bonus, first rival spawns |
| 2 | Local | 30 days | Magic Rewind safety removed, dynasty bonuses compound |
| 3 | Local→Regional | 1 season | Second city slot, rivals reference history in-world |
| 4 | Regional | 1 season | Conclave dynasty scoring unlocks (cross-run) |
| 5 | Regional | 1 season | B-tier archetype specializations, rivals compete for quests |
| 6 | Regional→Continental | 1 season | Second kingdom region opens |
| 7 | Continental | 1 year | Inter-guild diplomacy (recruit from rivals, trade adventurers) |
| 8 | Continental | 1 year | Second Legendary archetype slot, third city slot |
| 9 | Continental | 1 year | SS-tier prestige path opens, rival sub-guilds appear |
| 10 | Continental→WorldFamous | 1 year | Master Mentor unlocks, escalated requirements begin |
| 11 | WorldFamous | 5 years | Guild inheritance (heirlooms pass between runs) |
| 12 | WorldFamous | 5 years | Passive reputation income, world events triggered by dynasty |
| 13 | WorldFamous | 5 years | Hall of Heroes mentoring (legacy trains living adventurers) |
| 14 | WorldFamous | 5 years | Second guild house in a new region, royal contract quests |
| 15 | WorldFamous→Mythic | 5 years | Legendary Council (passive advisory system) |
| 16+ | Mythic | Uncapped | World-reshaping events, dynasty becomes a world institution |

See `docs/design/idle-progression.md` for full idle cap and crisis system.

---

## What Is Still TBD

- Tutorial prestige sequence exact structure (ideas exist, not locked)
- Cataclysmic event backstory details (to be revealed through play)
- NPC guild minimum tenure numbers (principle locked, numbers need tuning)
- Prestige benefits specifics beyond class options (dynasty bonuses, unlocks)

---

## Implementation Notes

- `checkPrestigeConditions` (system 9) sets `state.flags.prestigeAvailable`
- `checkForcedPrestige` (system 11) handles forced window logic
- Both are **stubs** — escalation table and forced window table are locked and can be implemented
- Balance constants needed in `balance.ts`:
  - `PRESTIGE_ESCALATION_THRESHOLD` (prestige 10 — Master Mentor unlock)
  - `MYTHIC_STATUS_PRESTIGE` (prestige 16)
  - Forced window year constants per prestige number
