/**
 * processTransientVisitors — System 6 of 13 in the tick pipe.
 *
 * Manages non-guild adventurers visiting the guild house:
 * - Removes expired visitors (past expiresAtTick and heldUntilTick)
 * - Randomly spawns new visitors up to PLACEHOLDER_MAX_VISITORS
 * - Emits arrival and departure events
 *
 * Pure function — no mutations, no side effects.
 * Accepts an optional `random` parameter for testability (defaults to Math.random).
 */

import type {
  GameState,
  TransientVisitor,
  AdventurerTier,
  AdventurerArchetype,
  VisitorServiceRequest,
} from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import {
  PLACEHOLDER_VISITOR_SPAWN_CHANCE,
  PLACEHOLDER_MAX_VISITORS,
  PLACEHOLDER_VISITOR_STAY_TICKS,
} from '../data/balance';
import { VISITOR_NAMES } from '../data/visitorNames';

/** Weighted tier selection — favors F and D tiers for visitors. */
const VISITOR_TIER_WEIGHTS: readonly { tier: AdventurerTier; weight: number }[] = [
  { tier: 'F', weight: 30 },
  { tier: 'E', weight: 25 },
  { tier: 'D', weight: 20 },
  { tier: 'C', weight: 12 },
  { tier: 'B', weight: 7 },
  { tier: 'A', weight: 4 },
  { tier: 'S', weight: 1.5 },
  { tier: 'SS', weight: 0.4 },
  { tier: 'Legendary', weight: 0.1 },
];

const VISITOR_TIER_TOTAL_WEIGHT = VISITOR_TIER_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);

/** Pick a tier based on weighted random. */
function pickWeightedTier(roll: number): AdventurerTier {
  const target = roll * VISITOR_TIER_TOTAL_WEIGHT;
  let cumulative = 0;
  for (const { tier, weight } of VISITOR_TIER_WEIGHTS) {
    cumulative += weight;
    if (target < cumulative) return tier;
  }
  return 'F';
}

/** Archetypes available for visitors (null means no archetype for low tiers). */
const VISITOR_ARCHETYPES: readonly (AdventurerArchetype | null)[] = [
  null,
  'Fighter',
  'Rogue',
  'Mage',
  'Ranger',
  'Cleric',
  'Bard',
  'Paladin',
  'Warlock',
];

const SERVICE_REQUESTS: readonly VisitorServiceRequest[] = [
  'Quest',
  'Training',
  'Repair',
  'Health',
  'Lodging',
];

/** Check if a visitor has expired. */
function isExpired(visitor: TransientVisitor, ticksElapsed: number): boolean {
  if (ticksElapsed < visitor.expiresAtTick) return false;
  if (visitor.heldUntilTick !== null && ticksElapsed < visitor.heldUntilTick) return false;
  return true;
}

/** Create a new random visitor. */
function spawnVisitor(ticksElapsed: number, random: () => number): TransientVisitor {
  const name = VISITOR_NAMES[Math.floor(random() * VISITOR_NAMES.length)] ?? 'Traveler';
  const tier = pickWeightedTier(random());
  const archetype = VISITOR_ARCHETYPES[Math.floor(random() * VISITOR_ARCHETYPES.length)] ?? null;
  const serviceRequest =
    SERVICE_REQUESTS[Math.floor(random() * SERVICE_REQUESTS.length)] ?? 'Quest';

  return {
    id: createId('vis'),
    name,
    tier,
    archetype,
    serviceRequest,
    arrivedAtTick: ticksElapsed,
    expiresAtTick: ticksElapsed + PLACEHOLDER_VISITOR_STAY_TICKS,
    heldUntilTick: null,
    holdCount: 0,
  };
}

/**
 * Process transient visitors for one tick.
 *
 * @param state - The current GameState (immutable input)
 * @param random - Random number generator (0-1), injectable for testing
 * @returns A new GameState after processing visitors
 */
export function processTransientVisitors(
  state: GameState,
  random: () => number = Math.random,
): GameState {
  const ticksElapsed = state.time.ticksElapsed;
  const currentVisitors = state.transientVisitors;
  const newVisitors: Record<string, TransientVisitor> = {};
  const pendingEvents = [...state.pendingEvents];

  // Phase 1: Remove expired visitors, keep valid ones
  for (const [id, visitor] of Object.entries(currentVisitors)) {
    if (isExpired(visitor, ticksElapsed)) {
      pendingEvents.push({
        id: createId('evt'),
        tick: ticksElapsed,
        type: 'VISITOR_DEPARTURE',
        message: `${visitor.name} has left the guild house.`,
        achievementKey: null,
      });
    } else {
      newVisitors[id] = visitor;
    }
  }

  // Phase 2: Attempt to spawn a new visitor
  const visitorCount = Object.keys(newVisitors).length;
  if (visitorCount < PLACEHOLDER_MAX_VISITORS && random() < PLACEHOLDER_VISITOR_SPAWN_CHANCE) {
    const visitor = spawnVisitor(ticksElapsed, random);
    newVisitors[visitor.id] = visitor;

    pendingEvents.push({
      id: createId('evt'),
      tick: ticksElapsed,
      type: 'VISITOR_ARRIVAL',
      message: `${visitor.name} (${visitor.tier}) has arrived seeking ${visitor.serviceRequest}.`,
      achievementKey: null,
    });
  }

  return {
    ...state,
    transientVisitors: newVisitors,
    pendingEvents,
  };
}
