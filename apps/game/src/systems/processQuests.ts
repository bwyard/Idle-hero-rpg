/**
 * processQuests — System 4 of 12 in the tick pipe.
 *
 * Advances active quest progress, resolves completions, and distributes
 * rewards to the guild and the assigned adventurer.
 *
 * Design decisions pending: reward distributions per quest tier, adventurer
 * XP from quest completion. stubQuestRewardImpl satisfies the contract and
 * keeps CI green. Swap in a live impl when those values are tuned —
 * this function does not change.
 *
 * Quest generation (new quests appearing on the board) is separate —
 * requires the ID strategy decision to be closed first (Phase 2).
 *
 * Pure function — no mutations, no side effects.
 */

import type { GameState, QuestRewardImpl } from '@idle-hero-rpg/shared';
import { createId } from '@idle-hero-rpg/shared';
import { PLACEHOLDER_QUEST_GOLD_REWARD, PLACEHOLDER_QUEST_XP_REWARD } from '../data/balance';

export const stubQuestRewardImpl: QuestRewardImpl = {
  goldReward: () => 0,
  adventurerXpReward: () => 0,
};

/** placeholder — tune during balance pass */
export const placeholderQuestRewardImpl: QuestRewardImpl = {
  goldReward: () => PLACEHOLDER_QUEST_GOLD_REWARD, // placeholder — tune during balance pass
  adventurerXpReward: () => PLACEHOLDER_QUEST_XP_REWARD, // placeholder — tune during balance pass
};

export function processQuests(
  state: GameState,
  impl: QuestRewardImpl = placeholderQuestRewardImpl,
): GameState {
  let next = state;

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

    // Quest complete — distribute rewards
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
        [id]: { ...quest, ticksRemaining: 0, isComplete: true, assignedAdventurerId: null },
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
