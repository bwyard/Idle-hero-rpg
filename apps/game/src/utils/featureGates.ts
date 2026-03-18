/**
 * featureGates — ADR-010 compliant feature gate functions.
 *
 * Separates active-run gates (GameState only) from cross-run gates
 * (require DynastyState). Cross-run gates accept `DynastyState | null`
 * and return false when dynasty is not yet loaded — keeps gates safe
 * during the deferred dynasty load window.
 *
 * Pure functions — no mutations, no side effects.
 */

import type { GameState, DynastyState } from '@idle-hero-rpg/shared';
import {
  MASTER_MENTOR_UNLOCK_PRESTIGE,
  MASTER_MENTOR_ACTION_POINT_COST,
  MAGIC_REWIND_SAFETY_MAX_PRESTIGE,
} from '../data/balance';

// ─── Active-run gates (no dynasty needed) ───────────────────────────────────

/**
 * Whether the Magic Rewind safety net is active for the current run.
 *
 * True when the dynasty's prestige count is at or below the safety threshold.
 * In early prestiges the safety net triggers a rewind to the last checkpoint
 * when gold goes negative. Above the threshold, players face consequences directly.
 *
 * Uses state.dynasty (the embedded snapshot in GameState) — does not require
 * the deferred DynastyState slice.
 */
export function hasMagicRewindSafety(state: GameState): boolean {
  return state.dynasty.prestigeCount <= MAGIC_REWIND_SAFETY_MAX_PRESTIGE;
}

// ─── Cross-run gates (require DynastyState) ─────────────────────────────────

/**
 * Whether the Master Mentor milestone ability is unlocked for this dynasty.
 *
 * Requires dynasty to be loaded and prestige count to be at or above the
 * unlock threshold. Returns false when dynasty is null (not yet loaded).
 */
export function isMasterMentorUnlocked(_state: GameState, dynasty: DynastyState | null): boolean {
  if (dynasty === null) return false;
  return dynasty.prestigeCount >= MASTER_MENTOR_UNLOCK_PRESTIGE;
}

/**
 * Whether the Skill Borrow action is available this Conclave cycle.
 *
 * Requires:
 * - Master Mentor unlocked (dynasty prestige ≥ threshold)
 * - Hero has enough action points to pay the cost
 *
 * Returns false when dynasty is null (not yet loaded).
 */
export function isSkillBorrowAvailable(state: GameState, dynasty: DynastyState | null): boolean {
  if (!isMasterMentorUnlocked(state, dynasty)) return false;
  return state.hero.actionPoints >= MASTER_MENTOR_ACTION_POINT_COST;
}
