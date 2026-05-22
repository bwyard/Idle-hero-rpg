/**
 * testID selector smoke tests — verifies data-testid attributes are present
 * and hold correct values.
 *
 * These tests validate the testID strategy: where text/role selectors
 * cannot target a specific value (gold amount, tick count, per-adventurer XP),
 * data-testid attributes on Text nodes give a stable, precise handle.
 *
 * RN Web maps testID → data-testid in the DOM.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('testID selectors', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test.describe('stats-gold', () => {
    test('shows starting gold of 500', async ({ page }) => {
      await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('500');
    });

    test('decreases after a recruit action', async ({ page }) => {
      await page.getByText('Recruit (50g)').click({ force: true });
      await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('450');
    });
  });

  test.describe('tick-count', () => {
    test('starts at 0', async ({ page }) => {
      await expect(page.locator('[data-testid="tick-count"]')).toHaveText('0');
    });

    test('increments after Tick +1', async ({ page }) => {
      await page.getByText('Tick +1').click({ force: true });
      await expect(page.locator('[data-testid="tick-count"]')).toHaveText('1');
    });

    test('increments correctly after multiple ticks', async ({ page }) => {
      for (let i = 0; i < 5; i++) {
        await page.getByText('Tick +1').click({ force: true });
      }
      await expect(page.locator('[data-testid="tick-count"]')).toHaveText('5');
    });
  });

  test.describe('xp-{id} per-adventurer XP', () => {
    test('renders XP text for each starter adventurer', async ({ page }) => {
      await expect(page.locator('[data-testid^="xp-"]')).toHaveCount(2);
    });

    test('XP text contains a "/" separator', async ({ page }) => {
      for (const el of await page.locator('[data-testid^="xp-"]').all()) {
        const text = await el.textContent();
        expect(text).toContain('/');
      }
    });
  });
});
