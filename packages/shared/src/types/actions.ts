/**
 * GameAction — discriminated union of all player actions.
 *
 * The dispatch function is the only entry point for player-initiated
 * state changes. Each action maps to a case in dispatch().
 */

/** Placeholder action — replaced as features are implemented. */
export interface NoOpAction {
  readonly type: 'NOOP';
}

/** All possible player actions. Add new action types here as features are built. */
export type GameAction = NoOpAction;
