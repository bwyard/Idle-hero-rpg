/**
 * Quest types — shared domain types for quests.
 */

/** Live quest state stored in the save file. */
export interface Quest {
  readonly id: string;
  /** Reference to the static QuestTemplate by ID. */
  readonly templateId: string;
  /** ID of the adventurer assigned to this quest. */
  assignedAdventurerId: string | null;
  ticksRemaining: number;
  isComplete: boolean;
  /**
   * Tick at which this quest completed. Used by processQuests to prune
   * completed quests after a display delay — prevents unbounded growth of
   * the quests record across a long run. Null while quest is still active.
   */
  completedAtTick: number | null;
}
