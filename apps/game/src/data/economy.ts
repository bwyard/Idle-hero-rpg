/**
 * economy.ts — All economy-related balance constants.
 *
 * Isolated from balance.ts so economy tuning can happen independently.
 * Future: swap this file for seasonal events, festivals, or prestige modifiers.
 *
 * balance.ts re-exports everything from this file.
 * Systems import from balance.ts, never directly from economy.ts.
 */

// ─── Income ──────────────────────────────────────────────────────────────────

/** Base passive gold income per tick, before building bonuses. */
export const PLACEHOLDER_BASE_INCOME_PER_TICK = 2;

/** Additional gold per building level per tick. */
export const PLACEHOLDER_INCOME_PER_BUILDING_LEVEL_PER_TICK = 3;

/** Building income per level per tick (for building production system). */
export const PLACEHOLDER_BUILDING_INCOME_PER_LEVEL = 3;

// ─── Upkeep ──────────────────────────────────────────────────────────────────

/** Gold deducted per adventurer per tick for upkeep. */
export const PLACEHOLDER_UPKEEP_PER_ADVENTURER_PER_TICK = 1;

// ─── Costs ───────────────────────────────────────────────────────────────────

/** Gold cost to recruit a new adventurer via dispatch action. */
export const PLACEHOLDER_RECRUIT_COST = 50;

/** Gold cost to construct a new building via dispatch action. */
export const PLACEHOLDER_BUILD_COST = 100;

/** Gold cost to hold a feast via dispatch action. */
export const PLACEHOLDER_FEAST_COST = 75;

/** Gold cost to engage (recruit) a transient visitor. */
export const PLACEHOLDER_ENGAGE_COST = 25;

/** Base cost to upgrade a building one level. Actual = base × level². */
export const PLACEHOLDER_UPGRADE_COST_BASE = 100;

/** Base cost to expand to a new city. Actual = base + (perCity × citiesOwned). */
export const PLACEHOLDER_CITY_EXPANSION_BASE = 500;

/** Additional cost per city already owned when expanding. */
export const PLACEHOLDER_CITY_EXPANSION_PER_CITY = 250;

// ─── Rewards ─────────────────────────────────────────────────────────────────

/** Gold earned on quest completion. */
export const PLACEHOLDER_QUEST_GOLD_REWARD = 50;

/** XP earned by adventurer on quest completion. */
export const PLACEHOLDER_QUEST_XP_REWARD = 5;

/** XP bonus each adventurer receives from a feast. */
export const PLACEHOLDER_FEAST_XP_BONUS = 3;

// ─── Starting Values ─────────────────────────────────────────────────────────

/** Starting gold for a new game. */
export const PLACEHOLDER_STARTING_GOLD = 500;

// ─── Magic Rewind ────────────────────────────────────────────────────────────

/**
 * Prestige count at which the safety net (Magic Rewind) is removed.
 * Below this threshold, negative gold triggers a rewind to the last checkpoint.
 * At and above this threshold, players face consequences directly.
 */
export const MAGIC_REWIND_SAFETY_MAX_PRESTIGE = 5;

// ─── Building Upgrades ───────────────────────────────────────────────────────

/** Ticks required per level of upgrade. Actual = base × targetLevel. */
export const PLACEHOLDER_UPGRADE_DURATION_TICKS_PER_LEVEL = 60;

/** Maximum building level. */
export const PLACEHOLDER_MAX_BUILDING_LEVEL = 10;
