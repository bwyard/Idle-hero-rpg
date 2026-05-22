/**
 * Building & Economy E2E tests — build, feast, and verify gold changes.
 *
 * Starting gold: 500. Build costs 100g, Feast costs 75g, Recruit costs 50g.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Building and Economy', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('starts with 500 gold', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('500');
  });

  test('building costs 100 gold', async ({ page }) => {
    const goldBefore = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );
    await page.getByText('Build (100g)').click({ force: true });
    const goldAfter = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );
    expect(goldAfter).toBe(goldBefore - 100);
  });

  test('feast costs 75 gold', async ({ page }) => {
    const goldBefore = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );
    await page.getByText('Feast (75g)').click({ force: true });
    const goldAfter = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );
    expect(goldAfter).toBe(goldBefore - 75);
  });

  test('gold updates correctly after multiple actions', async ({ page }) => {
    // 500 - 50 = 450
    await page.getByText('Recruit (50g)').click({ force: true });
    await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('450');

    // 450 - 100 = 350
    await page.getByText('Build (100g)').click({ force: true });
    await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('350');

    // 350 - 75 = 275
    await page.getByText('Feast (75g)').click({ force: true });
    await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('275');
  });

  test('building a building changes gold by 100', async ({ page }) => {
    await page.getByText('Build (100g)').click({ force: true });
    await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('400');
  });

  test('tick advances the economy and generates passive gold', async ({ page }) => {
    await page.getByText('Build (100g)').click({ force: true });
    const goldAfterBuild = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );

    for (let i = 0; i < 10; i++) {
      await page.getByText('Tick +1').click({ force: true });
    }

    const goldAfterTicks = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );
    expect(goldAfterTicks).not.toBe(goldAfterBuild);
  });

  test('feast grants XP to adventurers', async ({ page }) => {
    await page.getByText('Recruit (50g)').click({ force: true });

    const xpText = await page.locator('[data-testid^="xp-"]').first().textContent();
    const xpBefore = parseInt((xpText ?? '0').split('/')[0] ?? '0', 10);

    await page.getByText('Feast (75g)').click({ force: true });

    const xpTextAfter = await page.locator('[data-testid^="xp-"]').first().textContent();
    const xpAfter = parseInt((xpTextAfter ?? '0').split('/')[0] ?? '0', 10);
    expect(xpAfter).toBeGreaterThan(xpBefore);
  });

  test('can build multiple buildings', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.getByText('Build (100g)').click({ force: true });
    }
    // 500 - 300 = 200
    await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('200');
  });
});
