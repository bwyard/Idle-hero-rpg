/**
 * Event types — shared domain types for the event log.
 */

/** Achievement keys — stub for future Google Play integration. */
export type AchievementKey =
  | 'FIRST_PRESTIGE'
  | 'FIRST_LEGENDARY'
  | 'MYTHIC_STATUS'
  | 'TEN_PRESTIGES'
  | 'MASTER_MENTOR_UNLOCKED';

/** A single game event entry. */
export interface GameEvent {
  readonly id: string;
  readonly tick: number;
  readonly type: string;
  readonly message: string;
  /** Optional achievement key for future Google Play integration. Nullable stub. */
  readonly achievementKey: AchievementKey | null;
}
