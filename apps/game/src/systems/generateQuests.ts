/**
 * generateQuests — Populates the quest board with new unassigned quests.
 *
 * Pure function — no mutations, no side effects.
 * Called via GENERATE_QUESTS dispatch action, NOT part of the tick pipe.
 *
 * Logic:
 * 1. Count unassigned quests currently on the board
 * 2. If below PLACEHOLDER_MAX_QUEST_BOARD_SIZE, generate new ones
 * 3. Only pick templates whose region matches an unlocked city
 * 4. Random selection from matching templates
 */

import type { GameState, Region } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import { prngRangeInt } from '@prime/prime-random';
import { PLACEHOLDER_MAX_QUEST_BOARD_SIZE, TICKS_PER_DAY } from '../data/balance';
import { QUEST_TEMPLATES } from '../data/questTemplates';

/**
 * Generate new unassigned quests to fill the quest board up to the max size.
 *
 * @param state - The current GameState (immutable input)
 * @returns A new GameState with additional unassigned quests
 */
export const generateQuests = (state: GameState): GameState => {
  const currentUnassigned = Object.values(state.quests).filter(
    (q) => q.assignedAdventurerId === null && !q.isComplete,
  );

  const slotsToFill = PLACEHOLDER_MAX_QUEST_BOARD_SIZE - currentUnassigned.length;
  if (slotsToFill <= 0) return state;

  // Determine which regions are unlocked
  const unlockedRegions = new Set<Region>();
  for (const city of Object.values(state.cities)) {
    if (city.isUnlocked) {
      unlockedRegions.add(city.region);
    }
  }

  if (unlockedRegions.size === 0) return state;

  // Filter templates to those matching unlocked regions
  const eligibleTemplates = Object.values(QUEST_TEMPLATES).filter((t) =>
    unlockedRegions.has(t.region),
  );

  if (eligibleTemplates.length === 0) return state;

  // Generate new quests — thread seed forward across each slot fill.
  const { quests: newQuests, rngSeed: finalSeed } = Array.from<null>({
    length: slotsToFill,
  }).reduce(
    (acc: { quests: GameState['quests']; rngSeed: number }) => {
      const [templateIdx, nextSeed] = prngRangeInt(acc.rngSeed, eligibleTemplates.length);
      const template = eligibleTemplates[templateIdx];
      if (!template) return { ...acc, rngSeed: nextSeed };
      const questId = createId('qst');
      return {
        quests: {
          ...acc.quests,
          [questId]: {
            id: questId,
            templateId: template.id,
            assignedAdventurerId: null,
            ticksRemaining: template.baseDurationDays * TICKS_PER_DAY,
            isComplete: false,
            completedAtTick: null,
            minTier: template.minTier,
            partySize: template.partySize,
            region: template.region,
            difficulty: template.difficulty,
          },
        },
        rngSeed: nextSeed,
      };
    },
    { quests: state.quests, rngSeed: state.rngSeed },
  );

  return {
    ...state,
    rngSeed: finalSeed,
    quests: newQuests,
  };
};
