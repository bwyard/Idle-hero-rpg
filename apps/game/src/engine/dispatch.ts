/**
 * dispatch — Pure function for applying player actions to GameState.
 *
 * ARCHITECTURE RULES (non-negotiable):
 * - This is a pure function. No mutations, no side effects.
 * - Takes a GameState and an Action, returns a new GameState.
 * - UI calls dispatch; dispatch never calls into React.
 */

import type { GameState, GameAction } from '@idle-hero-rpg/shared';

/**
 * Apply a player action to the current game state.
 *
 * @param state - The current GameState (immutable input)
 * @param action - The action to apply
 * @returns A new GameState after applying the action
 */
export function dispatch(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // Actions will be added here as features are implemented.
    default:
      return state;
  }
}
