/**
 * Quest types — shared domain types for quests.
 */

import type { AdventurerTier } from './adventurer';

/** How difficult the quest is — drives XP reward multiplier. */
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

/** Live quest state stored in the save file. */
export interface Quest {
  readonly id: string;
  /** Reference to the static QuestTemplate by ID. */
  readonly templateId: string;
  /** ID of the adventurer assigned to this quest. */
  readonly assignedAdventurerId: string | null;
  readonly ticksRemaining: number;
  readonly isComplete: boolean;
  /**
   * Tick at which this quest completed. Used by processQuests to prune
   * completed quests after a display delay — prevents unbounded growth of
   * the quests record across a long run. Null while quest is still active.
   */
  readonly completedAtTick: number | null;
  /**
   * Minimum adventurer tier required to take this quest.
   * Enforced in dispatch — START_QUEST returns state unchanged if the
   * assigned adventurer is below this tier.
   */
  readonly minTier: AdventurerTier;
  /**
   * How many adventurers this quest requires.
   * 1 = solo quest (fully supported).
   * 2–3 = party quest (field stubbed; engine only handles partySize === 1 for now).
   * NOTE: Party quest assignment logic is a known gap — partySize > 1 is tracked
   * as a future extension. The field must be present so templates can declare
   * intent; the dispatch guard ignores it until party assignment is designed.
   */
  readonly partySize: number;
  /** The region this quest is located in. */
  readonly region: string;
  /** Difficulty level — used to multiply the base XP reward at completion. */
  readonly difficulty: QuestDifficulty;
}
