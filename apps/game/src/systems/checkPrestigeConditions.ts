/**
 * checkPrestigeConditions — System 10 of 13 in the tick pipe.
 *
 * Sets flags.prestigeAvailable when the player has at least one qualifying
 * successor in the current roster. Prestige is a player choice — this system
 * only signals readiness; it never forces a transition.
 *
 * Requirements are data (PRESTIGE_REQUIREMENTS), not control flow.
 * Each row is tried from highest minPrestige down; the first match wins.
 * Within a row, ANY condition satisfying its count threshold passes.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, AdventurerTier } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';

// ─── Tier rank ────────────────────────────────────────────────────────────────

const TIER_RANK: Readonly<Record<AdventurerTier, number>> = {
  F: 0,
  E: 1,
  D: 2,
  C: 3,
  B: 4,
  A: 5,
  S: 6,
  SS: 7,
  Legendary: 8,
};

// ─── Requirement table (docs/design/prestige.md) ─────────────────────────────

/** A single "OR" option within a prestige requirement row. */
type PrestigeOption = { readonly tier: AdventurerTier; readonly count: number };

/** One row of the escalation table. Sorted highest-first so .find stops early. */
type PrestigeRow = {
  readonly minPrestige: number;
  readonly options: readonly PrestigeOption[];
};

const PRESTIGE_REQUIREMENTS: readonly PrestigeRow[] = [
  {
    minPrestige: 16,
    options: [
      { tier: 'Legendary', count: 1 },
      { tier: 'SS', count: 2 },
      { tier: 'S', count: 3 },
      { tier: 'A', count: 4 },
    ],
  },
  {
    minPrestige: 13,
    options: [
      { tier: 'SS', count: 1 },
      { tier: 'S', count: 2 },
      { tier: 'A', count: 3 },
    ],
  },
  {
    minPrestige: 10,
    options: [
      { tier: 'S', count: 1 },
      { tier: 'A', count: 2 },
      { tier: 'B', count: 3 },
    ],
  },
  {
    minPrestige: 7,
    options: [
      { tier: 'A', count: 1 },
      { tier: 'B', count: 2 },
    ],
  },
  {
    minPrestige: 4,
    options: [
      { tier: 'B', count: 1 },
      { tier: 'C', count: 2 },
    ],
  },
  { minPrestige: 0, options: [{ tier: 'C', count: 1 }] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const countAtOrAbove = (adventurers: GameState['adventurers'], minTier: AdventurerTier): number => {
  const minRank = TIER_RANK[minTier];
  return Object.values(adventurers).filter(
    (a) => a.retiredYear === null && TIER_RANK[a.tier] >= minRank,
  ).length;
};

const meetsPrestigeRequirement = (
  adventurers: GameState['adventurers'],
  prestigeCount: number,
): boolean => {
  const row = PRESTIGE_REQUIREMENTS.find((r) => prestigeCount >= r.minPrestige);
  return (
    row?.options.some(({ tier, count }) => countAtOrAbove(adventurers, tier) >= count) ?? false
  );
};

// ─── System ───────────────────────────────────────────────────────────────────

export const checkPrestigeConditions = (state: GameState): GameState => {
  const conditionMet = meetsPrestigeRequirement(state.adventurers, state.dynasty.prestigeCount);

  if (conditionMet === state.flags.prestigeAvailable) return state;

  const pendingEvents = conditionMet
    ? [
        ...state.pendingEvents,
        {
          id: createId('evt'),
          tick: state.time.ticksElapsed,
          type: 'PRESTIGE_AVAILABLE' as const,
          message: 'A worthy successor has emerged — prestige is available.',
          achievementKey: null,
          causeId: null,
        },
      ]
    : state.pendingEvents;

  return {
    ...state,
    flags: { ...state.flags, prestigeAvailable: conditionMet },
    pendingEvents,
  };
};
