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
