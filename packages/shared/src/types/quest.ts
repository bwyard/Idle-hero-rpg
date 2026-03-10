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
}
