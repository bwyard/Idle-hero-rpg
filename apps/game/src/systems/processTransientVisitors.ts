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
import { prngRangeInt, prngNext } from '@prime/prime-random';
import {
  PLACEHOLDER_VISITOR_SPAWN_CHANCE,
  PLACEHOLDER_MAX_VISITORS,
  PLACEHOLDER_VISITOR_STAY_DAYS,
  PLACEHOLDER_VISITOR_SERVICE_FEE,
  TICKS_PER_DAY,
} from '../data/balance';
import { VISITOR_NAMES } from '../data/visitorNames';
import { canFulfillService } from '../utils/serviceGates';

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
const pickWeightedTier = (roll: number): AdventurerTier => {
  const target = roll * VISITOR_TIER_TOTAL_WEIGHT;
  // Thread remaining budget forward — first tier that consumes past it wins.
  return VISITOR_TIER_WEIGHTS.reduce<{ tier: AdventurerTier; remaining: number }>(
    (acc, { tier, weight }) =>
      acc.remaining <= 0
        ? acc
        : weight > acc.remaining
          ? { tier, remaining: 0 }
          : { tier: acc.tier, remaining: acc.remaining - weight },
    { tier: 'F', remaining: target },
  ).tier;
};

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
const isExpired = (visitor: TransientVisitor, ticksElapsed: number): boolean => {
  if (ticksElapsed < visitor.expiresAtTick) return false;
  if (visitor.heldUntilTick !== null && ticksElapsed < visitor.heldUntilTick) return false;
  return true;
};

/** Create a new visitor using an injected random function (test seam). */
const spawnVisitorFromRandom = (
  ticksElapsed: number,
  random: () => number,
  fulfillableServices: readonly VisitorServiceRequest[] = SERVICE_REQUESTS,
): TransientVisitor => {
  const name = VISITOR_NAMES[Math.floor(random() * VISITOR_NAMES.length)] ?? 'Traveler';
  const tier = pickWeightedTier(random());
  const archetype = VISITOR_ARCHETYPES[Math.floor(random() * VISITOR_ARCHETYPES.length)] ?? null;
  const serviceRequest =
    fulfillableServices[Math.floor(random() * fulfillableServices.length)] ?? 'Quest';

  return {
    id: createId('vis'),
    name,
    tier,
    archetype,
    serviceRequest,
    serviceFee: PLACEHOLDER_VISITOR_SERVICE_FEE[tier] ?? 5,
    arrivedAtTick: ticksElapsed,
    expiresAtTick: ticksElapsed + PLACEHOLDER_VISITOR_STAY_DAYS * TICKS_PER_DAY,
    heldUntilTick: null,
    holdCount: 0,
  };
};

/** Create a new visitor by threading a seed forward — returns [visitor, nextSeed]. */
const spawnVisitorFromSeed = (
  ticksElapsed: number,
  seed: number,
  fulfillableServices: readonly VisitorServiceRequest[] = SERVICE_REQUESTS,
): [TransientVisitor, number] => {
  const [nameIdx, s1] = prngRangeInt(seed, VISITOR_NAMES.length);
  const name = VISITOR_NAMES[nameIdx] ?? 'Traveler';
  const [tierRoll, s2] = prngNext(s1);
  const tier = pickWeightedTier(tierRoll);
  const [archetypeIdx, s3] = prngRangeInt(s2, VISITOR_ARCHETYPES.length);
  const archetype = VISITOR_ARCHETYPES[archetypeIdx] ?? null;
  const [serviceIdx, s4] = prngRangeInt(s3, fulfillableServices.length);
  const serviceRequest = fulfillableServices[serviceIdx] ?? 'Quest';

  return [
    {
      id: createId('vis'),
      name,
      tier,
      archetype,
      serviceRequest,
      serviceFee: PLACEHOLDER_VISITOR_SERVICE_FEE[tier] ?? 5,
      arrivedAtTick: ticksElapsed,
      expiresAtTick: ticksElapsed + PLACEHOLDER_VISITOR_STAY_DAYS * TICKS_PER_DAY,
      heldUntilTick: null,
      holdCount: 0,
    },
    s4,
  ];
};

/**
 * Process transient visitors for one tick.
 *
 * @param state - The current GameState (immutable input)
 * @param random - Test seam: inject a controlled () => number to override seed-based randomness.
 *   When omitted, randomness is derived from state.rngSeed (production path).
 * @returns A new GameState after processing visitors
 */
export const processTransientVisitors = (
  state: GameState,
  /** Test seam: inject a controlled () => number to override seed-based randomness. */
  random?: () => number,
): GameState => {
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
        causeId: null,
      });
    } else {
      newVisitors[id] = visitor;
    }
  }

  // Phase 2: Attempt to spawn a new visitor (only for fulfillable services)
  const visitorCount = Object.keys(newVisitors).length;
  const fulfillableServices = SERVICE_REQUESTS.filter((service) =>
    canFulfillService(service, state.buildings),
  );

  if (random) {
    // Test path: use injected random, do not touch rngSeed.
    if (
      fulfillableServices.length > 0 &&
      visitorCount < PLACEHOLDER_MAX_VISITORS &&
      random() < PLACEHOLDER_VISITOR_SPAWN_CHANCE
    ) {
      const visitor = spawnVisitorFromRandom(ticksElapsed, random, fulfillableServices);
      newVisitors[visitor.id] = visitor;
      pendingEvents.push({
        id: createId('evt'),
        tick: ticksElapsed,
        type: 'VISITOR_ARRIVAL',
        message: `${visitor.name} (${visitor.tier}) has arrived seeking ${visitor.serviceRequest}.`,
        achievementKey: null,
        causeId: null,
      });
    }
    return { ...state, transientVisitors: newVisitors, pendingEvents };
  }

  // Production path: derive from seed, thread seed forward.
  const [spawnRoll, s1] = prngNext(state.rngSeed);
  if (
    fulfillableServices.length > 0 &&
    visitorCount < PLACEHOLDER_MAX_VISITORS &&
    spawnRoll < PLACEHOLDER_VISITOR_SPAWN_CHANCE
  ) {
    const [visitor, s2] = spawnVisitorFromSeed(ticksElapsed, s1, fulfillableServices);
    newVisitors[visitor.id] = visitor;
    pendingEvents.push({
      id: createId('evt'),
      tick: ticksElapsed,
      type: 'VISITOR_ARRIVAL',
      message: `${visitor.name} (${visitor.tier}) has arrived seeking ${visitor.serviceRequest}.`,
      achievementKey: null,
      causeId: null,
    });
    return { ...state, rngSeed: s2, transientVisitors: newVisitors, pendingEvents };
  }

  return { ...state, rngSeed: s1, transientVisitors: newVisitors, pendingEvents };
};
