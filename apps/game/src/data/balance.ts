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

/** Prestige counts at which world awareness tiers unlock. */
export const WORLD_AWARENESS_HIDDEN_MAX_PRESTIGE = 2;

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

// ─── Event Log ──────────────────────────────────────────────────────────────

/** Maximum number of events retained in the event log. Oldest trimmed first. */
export const EVENT_LOG_MAX_LENGTH = 500;
