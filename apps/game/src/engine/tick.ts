/**
 * tick — The core game loop function.
 *
 * ARCHITECTURE RULES (non-negotiable):
 * - This is a pure function. No mutations, no side effects.
 * - Uses pipe to chain system transformations in the defined order.
 * - Order matters — do not reorder systems without an ADR.
 *
 * System execution order (per ADR-001):
 * 1. advanceTime
 * 2. processEconomy
 * 3. processAdventurers
 * 4. processQuests
 * 5. processBuildings
 * 6. processTransientVisitors
 * 7. processHero
 * 8. processRivals
 * 9. processConclave
 * 10. checkPrestigeConditions
 * 11. checkLeaderPressure
 * 12. checkForcedPrestige
 * 13. processEventLog
 */

import type { GameState } from '@idle-hero-rpg/shared';
import { pipe } from './pipe';
import { advanceTime } from '../systems/advanceTime';
import { processEconomy } from '../systems/processEconomy';
import { processAdventurers } from '../systems/processAdventurers';
import { processQuests } from '../systems/processQuests';
import { processBuildings } from '../systems/processBuildings';
import { processTransientVisitors } from '../systems/processTransientVisitors';
import { processHero } from '../systems/processHero';
import { processRivals } from '../systems/processRivals';
import { processConclave } from '../systems/processConclave';
import { checkPrestigeConditions } from '../systems/checkPrestigeConditions';
import { checkLeaderPressure } from '../systems/checkLeaderPressure';
import { checkForcedPrestige } from '../systems/checkForcedPrestige';
import { processEventLog } from '../systems/processEventLog';

/**
 * Advance game state by one tick.
 *
 * @param state - The current GameState (immutable input)
 * @returns A new GameState after all systems have processed
 */
export const tick = (state: GameState): GameState => {
  return pipe(
    state,
    advanceTime,
    processEconomy,
    processAdventurers,
    processQuests,
    processBuildings,
    processTransientVisitors,
    processHero,
    processRivals,
    processConclave,
    checkPrestigeConditions,
    checkLeaderPressure,
    checkForcedPrestige,
    processEventLog,
  );
};
