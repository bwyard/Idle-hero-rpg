/**
 * balance.ts — ALL numeric constants live here.
 *
 * Every number that affects gameplay must be defined in this file.
 * Never hardcode magic numbers in engine or system files.
 *
 * TODO items are flagged for the dedicated economy design pass.
 */

// ─── Time ────────────────────────────────────────────────────────────────────

/** Duration of one in-game tick in milliseconds (real time). */
export const TICK_INTERVAL_MS = 1000;

/** Number of game ticks that make up one in-game year. */
export const TICKS_PER_YEAR = 120;

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

/** Tiers that collapse to aggregate counts on kingdom view (F, D, C). */
export const KINGDOM_VIEW_COLLAPSED_TIERS: readonly string[] = ['F', 'E', 'D'];

// ─── Prestige ────────────────────────────────────────────────────────────────

/**
 * Prestige count at which the safety net (Magic Rewind) is removed.
 * TODO: Exact threshold is a tuning decision — not yet locked.
 */
export const MAGIC_REWIND_SAFETY_MAX_PRESTIGE = 5; // placeholder — needs tuning pass

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

// ─── Economy (TODO — Design Incomplete) ──────────────────────────────────────
// The following values are stubs. Do not use these in production logic until
// the dedicated economy design pass is complete.

/** TODO: Gold earned per building per tick (per level). Needs design pass. */
export const GOLD_EARN_PER_BUILDING_LEVEL_PER_TICK = 0; // stub

/** TODO: Gold cost to upgrade a building one level. Needs design pass. */
export const GOLD_COST_BUILDING_UPGRADE_BASE = 0; // stub

/** TODO: Gold cost to expand to a new city. Needs design pass. */
export const GOLD_COST_CITY_EXPANSION = 0; // stub

/** TODO: Gold cost to recruit an adventurer. Needs design pass. */
export const GOLD_COST_RECRUIT_ADVENTURER = 0; // stub

/** TODO: Gold cost to hold a feast. Needs design pass. */
export const GOLD_COST_FEAST = 0; // stub

// ─── Placeholder Economy Values ─────────────────────────────────────────────
// These produce visible movement in the demo. Not final — tune during balance pass.

/** Base passive gold income per tick, before building bonuses. */
export const PLACEHOLDER_BASE_INCOME_PER_TICK = 10; // placeholder — tune during balance pass

/** Additional gold per building level per tick. */
export const PLACEHOLDER_INCOME_PER_BUILDING_LEVEL_PER_TICK = 5; // placeholder — tune during balance pass

/** Gold deducted per adventurer per tick for upkeep. */
export const PLACEHOLDER_UPKEEP_PER_ADVENTURER_PER_TICK = 2; // placeholder — tune during balance pass

/** Gold cost to recruit a new adventurer via dispatch action. */
export const PLACEHOLDER_RECRUIT_COST = 50; // placeholder — tune during balance pass

/** Gold cost to construct a new building via dispatch action. */
export const PLACEHOLDER_BUILD_COST = 100; // placeholder — tune during balance pass

/** Gold cost to hold a feast via dispatch action. */
export const PLACEHOLDER_FEAST_COST = 75; // placeholder — tune during balance pass

/** XP bonus each adventurer receives from a feast. */
export const PLACEHOLDER_FEAST_XP_BONUS = 3; // placeholder — tune during balance pass

/** Gold earned on quest completion. */
export const PLACEHOLDER_QUEST_GOLD_REWARD = 50; // placeholder — tune during balance pass

/** XP earned by adventurer on quest completion. */
export const PLACEHOLDER_QUEST_XP_REWARD = 5; // placeholder — tune during balance pass

/** Ticks required to complete a quest. */
export const PLACEHOLDER_QUEST_DURATION_TICKS = 30; // placeholder — tune during balance pass

/** Starting gold for a new game. */
export const PLACEHOLDER_STARTING_GOLD = 500; // placeholder — tune during balance pass

/** Building income per level per tick (for building production system). */
export const PLACEHOLDER_BUILDING_INCOME_PER_LEVEL = 5; // placeholder — tune during balance pass

// ─── Placeholder Adventurer Progression ─────────────────────────────────────

/** XP gained per tick by each adventurer. */
export const PLACEHOLDER_XP_PER_TICK = 1; // placeholder — tune during balance pass

/** XP thresholds for tier-up, keyed by current tier. */
export const PLACEHOLDER_TIER_XP_THRESHOLDS: Record<string, number> = {
  F: 10, // placeholder — tune during balance pass
  E: 25, // placeholder — tune during balance pass
  D: 50, // placeholder — tune during balance pass
  C: 100, // placeholder — tune during balance pass
  B: 200, // placeholder — tune during balance pass
  A: 400, // placeholder — tune during balance pass
  S: 800, // placeholder — tune during balance pass
  SS: 1600, // placeholder — tune during balance pass
};

/** Ticks a Legendary adventurer stays before retiring. */
export const PLACEHOLDER_LEGENDARY_RETIRE_TICKS = 500; // placeholder — tune during balance pass

// ─── Placeholder Hero ───────────────────────────────────────────────────────

/** Hero regenerates 1 AP every this many ticks. */
export const PLACEHOLDER_AP_REGEN_INTERVAL_TICKS = 10; // placeholder — tune during balance pass

// ─── Hero ─────────────────────────────────────────────────────────────────────

/** Maximum action points the hero can hold at one time. */
export const HERO_ACTION_POINT_MAX = 10; // TODO: tune during hero system design pass

// ─── World Awareness ─────────────────────────────────────────────────────────

/** Prestige counts at which world awareness tiers unlock. */
export const WORLD_AWARENESS_HIDDEN_MAX_PRESTIGE = 2;

// ─── NPC Guilds ──────────────────────────────────────────────────────────────

/**
 * Minimum tenure for NPC guilds (in in-game years).
 * TODO: Exact numbers need tuning. Principle: NPC guilds have minimum lifespans.
 */
export const NPC_GUILD_MIN_TENURE_YEARS = 0; // stub — needs tuning pass

// ─── Event Log ──────────────────────────────────────────────────────────────

/** Maximum number of events retained in the event log. Oldest trimmed first. */
export const EVENT_LOG_MAX_LENGTH = 500;
