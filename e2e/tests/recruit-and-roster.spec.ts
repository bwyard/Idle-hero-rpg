/**
 * Recruit & Roster E2E tests — recruit an adventurer, verify roster,
 * navigate to detail page, and return.
 *
 * Initial state: 2 starter adventurers (Kira, Tomas) in dorm.
 * Starting gold: 500. Recruit costs 50g.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Recruit and Roster flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('starts with 500 gold and 2 starter adventurers', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('500');
    await expect(page.getByText('Adventurer Roster')).toBeAttached();
    await expect(page.locator('[data-testid^="xp-"]')).toHaveCount(2);
  });

  test('recruits an adventurer and gold decreases by 50', async ({ page }) => {
    const goldBefore = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );

    await page.getByText('Recruit (50g)').click({ force: true });

    const goldAfter = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );
    expect(goldAfter).toBe(goldBefore - 50);
  });

  test('recruited adventurer appears in the roster list', async ({ page }) => {
    await page.getByText('Recruit (50g)').click({ force: true });
    await expect(page.locator('[data-testid^="xp-"]')).toHaveCount(3);
  });

  test('clicking an adventurer navigates to the detail page', async ({ page }) => {
    await page.locator('[role="button"][aria-label^="View"]').first().click({ force: true });
    await expect(page).toHaveURL(/\/adventurer\//);
    await expect(page.getByText('Stats')).toBeAttached();
  });

  test('detail page shows adventurer name, tier F, and XP display', async ({ page }) => {
    const ariaLabel = await page
      .locator('[role="button"][aria-label^="View"]')
      .first()
      .getAttribute('aria-label');

    const nameMatch = ariaLabel?.match(/^View (.+), tier (.+)$/);
    const adventurerName = nameMatch?.[1] ?? '';
    const tier = nameMatch?.[2] ?? '';

    await page.locator('[role="button"][aria-label^="View"]').first().click({ force: true });

    await expect(page).toHaveURL(/\/adventurer\//);
    if (adventurerName) {
      await expect(page.getByText(adventurerName)).toBeAttached();
    }
    expect(tier).toBe('F');
    await expect(page.locator('[data-testid="adventurer-xp"]')).toBeAttached();
    await expect(page.locator('[data-testid="adventurer-xp"]')).toContainText('/');
  });

  test('can navigate back from detail page to the main screen', async ({ page }) => {
    await page.locator('[role="button"][aria-label^="View"]').first().click({ force: true });
    await expect(page).toHaveURL(/\/adventurer\//);

    await page.goBack();

    await expect(page.locator('[data-testid="stats-gold"]')).toBeAttached();
    await expect(page.getByText('Adventurer Roster')).toBeAttached();
  });

  test('can recruit multiple adventurers — overcapacity surcharge applies at 3rd', async ({
    page,
  }) => {
    // Dorm capacity = 4. 2 starters occupy dorm.
    // Recruit 1: 2 in dorm → 50g.  Gold: 500 - 50 = 450
    // Recruit 2: 3 in dorm → 50g.  Gold: 450 - 50 = 400
    // Recruit 3: 4 in dorm → ceil(50 * 1.5) = 75g. Gold: 400 - 75 = 325
    for (let i = 0; i < 3; i++) {
      await page.getByText('Recruit (50g)').click({ force: true });
    }

    await expect(page.locator('[data-testid="stats-gold"]')).toHaveText('325');
    await expect(page.locator('[role="button"][aria-label^="View"]')).toHaveCount(5);
  });
});
