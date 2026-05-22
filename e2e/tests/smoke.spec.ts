/**
 * Smoke test — verifies the Expo Web build loads and renders the game.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Home screen', () => {
  test('loads and displays the game title', async ({ page }) => {
    await gotoGame(page);
    await expect(page.getByText("Retired Hero's Guild")).toBeVisible();
  });
});
