/**
 * processQuests — System 4 of 12 in the tick pipe.
 *
 * Advances active quest progress, resolves completions, and distributes
 * rewards to the guild and the assigned adventurer.
 *
 * Also prunes completed quests after QUEST_PRUNE_DELAY_TICKS to prevent
 * unbounded growth of state.quests across a long run.
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, QuestRewardImpl } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import {
  PLACEHOLDER_QUEST_GOLD_REWARD,
  PLACEHOLDER_QUEST_XP_REWARD,
  QUEST_PRUNE_DELAY_TICKS,
} from '../data/balance';

export const stubQuestRewardImpl: QuestRewardImpl = {
  goldReward: () => 0,
  adventurerXpReward: () => 0,
};

/** placeholder — tune during balance pass */
export const placeholderQuestRewardImpl: QuestRewardImpl = {
  goldReward: () => PLACEHOLDER_QUEST_GOLD_REWARD,
  adventurerXpReward: () => PLACEHOLDER_QUEST_XP_REWARD,
};

export function processQuests(
  state: GameState,
  impl: QuestRewardImpl = placeholderQuestRewardImpl,
): GameState {
  let next = state;

  // Prune completed quests that have been displayed long enough
  for (const [id, quest] of Object.entries(state.quests)) {
    if (
      quest.isComplete &&
      quest.completedAtTick !== null &&
      state.time.ticksElapsed - quest.completedAtTick > QUEST_PRUNE_DELAY_TICKS
    ) {
      const { [id]: _pruned, ...remaining } = next.quests;
      next = { ...next, quests: remaining };
    }
  }

  // Advance active quests
  for (const [id, quest] of Object.entries(state.quests)) {
    if (quest.assignedAdventurerId === null) continue;
    if (quest.isComplete) continue;

    const newTicksRemaining = quest.ticksRemaining - 1;

    if (newTicksRemaining > 0) {
      next = {
        ...next,
        quests: {
          ...next.quests,
          [id]: { ...quest, ticksRemaining: newTicksRemaining },
        },
      };
      continue;
    }

    // Quest complete — distribute rewards and stamp completedAtTick
    const goldEarned = impl.goldReward(quest, state);
    const advXp = impl.adventurerXpReward(quest, state);
    const advId = quest.assignedAdventurerId;
    const adv = next.adventurers[advId];

    const questCompleteEvent = {
      id: createId('evt'),
      tick: state.time.ticksElapsed,
      type: 'QUEST_COMPLETE',
      message: `Quest complete! ${adv?.name ?? 'Unknown'} earned ${String(goldEarned)} gold and ${String(advXp)} XP.`,
      achievementKey: null,
    } as const;

    next = {
      ...next,
      quests: {
        ...next.quests,
        [id]: {
          ...quest,
          ticksRemaining: 0,
          isComplete: true,
          assignedAdventurerId: null,
          completedAtTick: state.time.ticksElapsed,
        },
      },
      adventurers: adv
        ? { ...next.adventurers, [advId]: { ...adv, xp: adv.xp + advXp } }
        : next.adventurers,
      guild: { ...next.guild, gold: next.guild.gold + goldEarned },
      pendingEvents: [...next.pendingEvents, questCompleteEvent],
    };
  }

  return next;
}
