/**
 * balance.ts — ALL numeric constants live here.
 *
 * Every number that affects gameplay must be accessible from this file.
 * Never hardcode magic numbers in engine or system files.
 *
 * Economy constants are defined in economy.ts and re-exported here.
 * Systems always import from balance.ts, never directly from economy.ts.
 */

// ─── Economy (from economy.ts) ──────────────────────────────────────────────
// Isolated so economy tuning can happen independently.
// Future: swap economy.ts for seasonal events, festivals, or prestige modifiers.
export {
  PLACEHOLDER_BASE_INCOME_PER_TICK,
  PLACEHOLDER_INCOME_PER_BUILDING_LEVEL_PER_TICK,
  PLACEHOLDER_BUILDING_INCOME_PER_LEVEL,
  PLACEHOLDER_UPKEEP_PER_ADVENTURER_PER_TICK,
  PLACEHOLDER_RECRUIT_COST,
  PLACEHOLDER_BUILD_COST,
  PLACEHOLDER_FEAST_COST,
  PLACEHOLDER_ENGAGE_COST,
  PLACEHOLDER_UPGRADE_COST_BASE,
  PLACEHOLDER_CITY_EXPANSION_BASE,
  PLACEHOLDER_CITY_EXPANSION_PER_CITY,
  PLACEHOLDER_QUEST_GOLD_REWARD,
  PLACEHOLDER_QUEST_XP_REWARD,
  PLACEHOLDER_FEAST_XP_BONUS,
  PLACEHOLDER_STARTING_GOLD,
  MAGIC_REWIND_SAFETY_MAX_PRESTIGE,
  PLACEHOLDER_UPGRADE_DURATION_TICKS_PER_LEVEL,
  PLACEHOLDER_MAX_BUILDING_LEVEL,
  PLACEHOLDER_RIVAL_SPAWN_CHANCE,
} from './economy';

// ─── Time ────────────────────────────────────────────────────────────────────

/** Duration of one in-game tick in milliseconds (real time). */
export const TICK_INTERVAL_MS = 1000;

/** Number of ticks that make up one in-game day. */
export const TICKS_PER_DAY = 4;

/** Number of seasons in one year. */
export const SEASONS_PER_YEAR = 4;

/** Ordered season names — index 0 is the first season of each year. */
export const SEASON_ORDER = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

/** Number of days in one in-game year. */
export const DAYS_PER_YEAR = 365;

/**
 * Base season lengths in days. Vary per year via getSeasonBoundaries().
 * Sum must always equal DAYS_PER_YEAR.
 */
export const BASE_SEASON_LENGTHS = [91, 93, 91, 90] as const; // Spring, Summer, Autumn, Winter

/**
 * Uniform days-per-season passed to stage-time's calendarTick.
 * stage-time currently requires a single number; variable-length seasons
 * are a known simplification (364-day year vs 365). Signal sent to stage
 * to support readonly number[] per season. Remove once landed.
 */
export const DAYS_PER_SEASON = 91;

/** Number of game ticks that make up one in-game year (derived: 365 days × 4 ticks). */
export const TICKS_PER_YEAR = DAYS_PER_YEAR * TICKS_PER_DAY; // 1460

/** Total active years in a single run. */
export const RUN_DURATION_YEARS = 50;

/** Guild lifespan range in years. */
export const GUILD_MIN_LIFESPAN_YEARS = 75;
export const GUILD_MAX_LIFESPAN_YEARS = 100;

/** Maximum number of leaders (prestige cycles) per guild. */
export const MAX_LEADERS = 4;
export const MIN_LEADERS_GUARANTEED = 2;

// ─── Conclave ────────────────────────────────────────────────────────────────

/** How often a Conclave occurs (in in-game years). */
export const CONCLAVE_INTERVAL_YEARS = 5;

// ─── Adventurer Tiers ────────────────────────────────────────────────────────

/** Ordered list of adventurer legacy tiers (F is lowest, Legendary is highest). */
export const ADVENTURER_TIERS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'Legendary'] as const;

/** Tiers that are prestige-eligible (C and above). */
export const PRESTIGE_ELIGIBLE_TIERS: readonly string[] = ['C', 'B', 'A', 'S', 'SS', 'Legendary'];

/** Tiers that collapse to aggregate counts on kingdom view (F, E, D). */
export const KINGDOM_VIEW_COLLAPSED_TIERS: readonly string[] = ['F', 'E', 'D'];

// ─── Prestige ────────────────────────────────────────────────────────────────

/**
 * Prestige count at which escalated requirements begin
 * (multiple high-tier adventurers required simultaneously).
 */
export const PRESTIGE_ESCALATION_THRESHOLD = 10;

/** Prestige rank at which Mythic world status is reached. */
export const MYTHIC_STATUS_PRESTIGE = 16;

/**
 * Forced prestige window — the year by which transition must happen.
 * Keyed by prestige count. Missing key = no forced transition (player control).
 * See docs/design/prestige.md § Forced Prestige Windows.
 */
export const FORCED_PRESTIGE_YEAR: Readonly<Record<number, number>> = {
  1: 25,
  2: 30,
  3: 35,
  4: 40,
  5: 45,
  6: 45,
};

/** Prestige count at which forced prestige windows no longer apply. */
export const FORCED_PRESTIGE_FREE_AT = 7;

/**
 * Leader pressure tiers — indexed by prestige count range.
 * See docs/design/prestige.md § Involuntary Leader Replacement.
 */
export const LEADER_PRESSURE_NONE_MAX = 3;
export const LEADER_PRESSURE_SOFT_MAX = 6;
export const LEADER_PRESSURE_MODERATE_MAX = 9;
export const LEADER_PRESSURE_REAL_MAX = 12;

/** Years a leader must have served before moderate pressure can apply. */
export const LEADER_TENURE_PRESSURE_THRESHOLD_YEARS = 20;

// ─── Master Mentor ───────────────────────────────────────────────────────────

/** Prestige rank at which Master Mentor ability unlocks. */
export const MASTER_MENTOR_UNLOCK_PRESTIGE = 10;

/** Action point cost for Master Mentor ability. */
export const MASTER_MENTOR_ACTION_POINT_COST = 2;

// ─── Kingdom ─────────────────────────────────────────────────────────────────

/** Total number of regions in the kingdom. */
export const KINGDOM_REGION_COUNT = 5;

/** Total number of locations in the kingdom. */
export const KINGDOM_LOCATION_MIN = 15;
export const KINGDOM_LOCATION_MAX = 20;

// ─── Quest ───────────────────────────────────────────────────────────────────

/** Days required to complete a quest. Systems multiply by TICKS_PER_DAY. */
export const PLACEHOLDER_QUEST_DURATION_DAYS = 8;

/** Maximum number of unassigned quests on the quest board at once. */
export const PLACEHOLDER_MAX_QUEST_BOARD_SIZE = 5;

/**
 * XP multiplier applied to the base XP reward based on quest difficulty.
 * processQuests multiplies PLACEHOLDER_QUEST_XP_REWARD by this value on completion.
 */
export const QUEST_XP_MULTIPLIER_BY_DIFFICULTY = {
  easy: 1,
  medium: 1.5,
  hard: 2.5,
  legendary: 5,
} as const;

/**
 * Ordered adventurer tier list used by the tier gate in dispatch.
 * Index position encodes tier rank — higher index = higher tier.
 * Matches ADVENTURER_TIERS but typed as AdventurerTier[] for guard logic.
 */
export const ADVENTURER_TIER_ORDER = [
  'F',
  'E',
  'D',
  'C',
  'B',
  'A',
  'S',
  'SS',
  'Legendary',
] as const;

/**
 * Ticks after completion before a quest is pruned from state.quests.
 * 40 ticks = 10 in-game days — enough for the player to see the Done badge.
 * Prevents unbounded growth of the quests record across a 50-year run.
 */
export const QUEST_PRUNE_DELAY_TICKS = 40;

// ─── Adventurer Progression ─────────────────────────────────────────────────

/**
 * Ambient XP gained per tick by idle adventurers (not on a quest).
 * Lower tiers gain more from ambient observation. Busy adventurers get 0.
 */
export const PLACEHOLDER_AMBIENT_XP_PER_TICK: Record<string, number> = {
  F: 0.5,
  E: 0.4,
  D: 0.3,
  C: 0.2,
  B: 0.15,
  A: 0.1,
  S: 0.05,
  SS: 0.02,
  Legendary: 0,
};

/** XP thresholds for tier-up, keyed by current tier. */
export const PLACEHOLDER_TIER_XP_THRESHOLDS: Record<string, number> = {
  F: 10,
  E: 25,
  D: 50,
  C: 100,
  B: 200,
  A: 400,
  S: 800,
  SS: 1600,
};

/** Days a Legendary adventurer stays before retiring. ~1 year. */
export const PLACEHOLDER_LEGENDARY_RETIRE_DAYS = 125;

// ─── Hero ─────────────────────────────────────────────────────────────────────

/** Hero regenerates 1 AP every this many days. */
export const PLACEHOLDER_AP_REGEN_INTERVAL_DAYS = 10;

/** Maximum action points the hero can hold at one time. */
export const HERO_ACTION_POINT_MAX = 10;

// ─── World Awareness ─────────────────────────────────────────────────────────

/**
 * Prestige count thresholds for each world awareness tier.
 * Sorted highest-first so a .find() on prestigeCount stops at the right tier.
 * (docs/design/prestige.md § World Awareness)
 */
export const WORLD_AWARENESS_THRESHOLDS: readonly {
  readonly minPrestige: number;
  readonly tier: string;
}[] = [
  { minPrestige: 16, tier: 'Mythic' },
  { minPrestige: 10, tier: 'WorldFamous' },
  { minPrestige: 6, tier: 'Continental' },
  { minPrestige: 3, tier: 'Regional' },
  { minPrestige: 1, tier: 'Local' },
  { minPrestige: 0, tier: 'Hidden' },
];

/** Placeholder gold bonus added to starting gold on each prestige. Tune during balance pass. */
export const PLACEHOLDER_PRESTIGE_GOLD_BONUS = 250;

/**
 * Idle cap in days per world awareness tier.
 * Past this cap consequences accumulate (see docs/design/idle-progression.md).
 * Placeholder — tune during playtesting.
 */
export const PLACEHOLDER_IDLE_CAP_DAYS: Record<string, number> = {
  Hidden: 7,
  Local: 30,
  Regional: 91, // 1 season
  Continental: 364, // 1 year
  WorldFamous: 1820, // 1 Conclave (5 years × 364 days)
  Mythic: Infinity,
};

/**
 * Consequence stack thresholds — fraction of idle cap exceeded before each stage fires.
 * Stage 1: quest board stops. Stage 2: morale drops. Stage 3: income drops.
 * Stage 4: rivals gain. Stage 5: crisis (force prestige or stop the clock).
 */
export const PLACEHOLDER_IDLE_CONSEQUENCE_THRESHOLDS = [0.25, 0.5, 0.75, 1.0, 1.25] as const;

// ─── NPC Guilds ──────────────────────────────────────────────────────────────

/**
 * Minimum tenure for NPC guilds (in in-game years) before dissolution is possible.
 * Placeholder — needs tuning. Principle: NPC guilds have minimum lifespans.
 */
export const NPC_GUILD_MIN_TENURE_YEARS = 5;

/** Maximum concurrent rival guilds tracked in GameState. Prevents unbounded growth across runs. */
export const MAX_RIVALS = 20;

/** Per-tick probability that a tenured rival guild dissolves. */
export const PLACEHOLDER_RIVAL_DISSOLVE_CHANCE = 0.0005;

// ─── Transient Visitors ─────────────────────────────────────────────────────

/** Probability of spawning a new visitor each tick (0–1). */
export const PLACEHOLDER_VISITOR_SPAWN_CHANCE = 0.05;

/** Maximum concurrent transient visitors at the guild house. */
export const PLACEHOLDER_MAX_VISITORS = 3;

/** Number of days a visitor stays before departing. */
export const PLACEHOLDER_VISITOR_STAY_DAYS = 60;

/** Base number of days a held visitor is retained for. */
export const PLACEHOLDER_HOLD_DURATION_DAYS = 30;

/**
 * Number of days a visitor stays after their request is approved (APPROVE_VISITOR).
 * After this duration their visit is considered complete and they may depart.
 */
export const PLACEHOLDER_VISITOR_SERVICE_DURATION_DAYS = 7;

/**
 * Gold earned by the guild when serving a visitor's request (SERVE_VISITOR).
 * Keyed by AdventurerTier — scales with visitor quality.
 * Placeholder values — tune during balance pass.
 */
export const PLACEHOLDER_VISITOR_SERVICE_FEE: Record<string, number> = {
  F: 5,
  E: 12,
  D: 25,
  C: 50,
  B: 100,
  A: 200,
  S: 400,
  SS: 800,
  Legendary: 1500,
};

// ─── Housing ─────────────────────────────────────────────────────────────────

/** Base dorm capacity (before any housing buildings). */
export const BASE_DORM_CAPACITY = 4;

/** Additional capacity added per Dormitory building level. */
export const DORM_CAPACITY_PER_LEVEL = 2;

/**
 * Gold surcharge multiplier when recruiting over dorm capacity.
 * e.g. 1.5 = 50% more than the standard recruit cost.
 */
export const OVERCAPACITY_RECRUIT_SURCHARGE = 1.5;

// ─── Event Log ──────────────────────────────────────────────────────────────

/** Maximum number of events retained in the event log. Oldest trimmed first. */
export const EVENT_LOG_MAX_LENGTH = 500;

// ─── Toast Notifications ─────────────────────────────────────────────────────

/** How long (ms) a toast stays visible before auto-dismissing. */
export const TOAST_DURATION_MS = 3000;

/** Maximum number of toasts visible simultaneously. Oldest drops off when exceeded. */
export const TOAST_MAX_COUNT = 3;
