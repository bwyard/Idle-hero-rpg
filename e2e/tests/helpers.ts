/**
 * Shared E2E helpers.
 *
 * gotoGame — navigates to the start screen with fresh state, clicks through
 * to the game tabs, and waits for the StatsBar to confirm the game is loaded.
 *
 * Usage:
 *   test.beforeEach(async ({ page }) => {
 *     await gotoGame(page);
 *   });
 *
 * Notes on RN Web:
 * - React Native Web wraps elements in Views with overflow:hidden and
 *   sometimes pointer-events:none. Use { force: true } on .click() calls
 *   that target Pressable/TouchableOpacity inside nested Views.
 * - Use toBeAttached() for existence checks on elements that may be
 *   outside the visible viewport due to overflow:hidden.
 */

import type { Page } from '@playwright/test';

/**
 * Navigate to the game screen with a fresh, empty game state.
 * Clears localStorage before navigation so initFromStorage uses defaults.
 */
export const gotoGame = async (page: Page): Promise<void> => {
  // addInitScript runs before page scripts on every navigation — clears
  // storage so the game always starts from createInitialGameState().
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto('/start');
  await page.locator('[data-testid="start-menu"]').waitFor();
  await page.getByTestId('btn-start-game').click({ force: true });
  await page.locator('[data-testid="stats-gold"]').waitFor();
};
