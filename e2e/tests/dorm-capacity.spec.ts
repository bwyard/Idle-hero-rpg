/**
 * Dorm Capacity E2E tests.
 *
 * Balance constants:
 *   PLACEHOLDER_STARTING_GOLD = 500
 *   PLACEHOLDER_RECRUIT_COST = 50
 *   BASE_DORM_CAPACITY = 4
 *   OVERCAPACITY_RECRUIT_SURCHARGE = 1.5
 *
 * Initial state: 2 starter adventurers already in dorm.
 * First 2 recruits cost 50g (fills to 4/4).
 * 3rd recruit onwards costs 75g (ceil(50 * 1.5)).
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Dorm Capacity — recruiting within capacity', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('starts with 500 gold', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-gold"]')).toContainText('500');
  });

  test('first recruit costs 50 gold (2 starters + 1 = 3/4 capacity)', async ({ page }) => {
    await page.getByText('Recruit (50g)').click({ force: true });
    await expect(page.locator('[data-testid="stats-gold"]')).toContainText('450');
  });

  test('second recruit costs 50 gold (4/4 capacity reached)', async ({ page }) => {
    for (let i = 0; i < 2; i++) {
      await page.getByText('Recruit (50g)').click({ force: true });
    }
    // 500 - (2 * 50) = 400
    await expect(page.locator('[data-testid="stats-gold"]')).toContainText('400');
  });
});

test.describe('Dorm Capacity — overcapacity surcharge', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('3rd recruit costs 75 gold (overcapacity surcharge: ceil(50 * 1.5))', async ({ page }) => {
    // Fill dorm: 2 recruits at 50g = 500 - 100 = 400
    for (let i = 0; i < 2; i++) {
      await page.getByText('Recruit (50g)').click({ force: true });
    }
    await expect(page.locator('[data-testid="stats-gold"]')).toContainText('400');

    // 3rd recruit with surcharge: 400 - 75 = 325
    await page.getByText('Recruit (50g)').click({ force: true });
    await expect(page.locator('[data-testid="stats-gold"]')).toContainText('325');
  });

  test('can continue recruiting with surcharge until gold runs out', async ({ page }) => {
    // Fill dorm: 2 at 50g = 400 remaining
    for (let i = 0; i < 2; i++) {
      await page.getByText('Recruit (50g)').click({ force: true });
    }

    // Overcapacity at 75g each:
    // 3rd: 400-75=325, 4th: 325-75=250, 5th: 250-75=175, 6th: 175-75=100, 7th: 100-75=25
    for (let i = 0; i < 5; i++) {
      await page.getByText('Recruit (50g)').click({ force: true });
    }
    await expect(page.locator('[data-testid="stats-gold"]')).toContainText('25');
  });

  test('recruiting fails when gold is insufficient', async ({ page }) => {
    // Drain to 25g: 2 at 50g + 5 at 75g = 475g spent
    for (let i = 0; i < 2; i++) {
      await page.getByText('Recruit (50g)').click({ force: true });
    }
    for (let i = 0; i < 5; i++) {
      await page.getByText('Recruit (50g)').click({ force: true });
    }
    await expect(page.locator('[data-testid="stats-gold"]')).toContainText('25');

    // Cannot afford 75g — gold should stay at 25
    await page.getByText('Recruit (50g)').click({ force: true });
    const gold = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );
    expect(gold).toBe(25);
  });
});
