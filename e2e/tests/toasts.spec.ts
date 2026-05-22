/**
 * Toast notification E2E tests.
 *
 * Toasts fire when a dispatch action is a no-op (e.g. insufficient gold).
 * The toast dispatch uses setTimeout(0) to avoid Zustand re-entrancy —
 * page.clock.fastForward(1) must be called after the failing action to flush it.
 *
 * Gold drain to trigger the failing recruit:
 *   - 2 recruits at 50g (fills dorm 4/4): gold = 400
 *   - 5 overcapacity recruits at 75g:     gold = 25
 *   - Next recruit needs 75g, has 25g → no-op → toast
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

const drainGoldToInsufficient = async (page: import('@playwright/test').Page): Promise<void> => {
  for (let i = 0; i < 7; i++) {
    await page.getByText('Recruit (50g)').click({ force: true });
    await page.locator('[data-testid="stats-gold"]').waitFor();
  }
};

test.describe('Toast notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('toast-stack container is present in the DOM', async ({ page }) => {
    await expect(page.locator('[data-testid="toast-stack"]')).toBeAttached();
  });

  test('no toasts are shown on initial load', async ({ page }) => {
    await expect(page.getByText('Not enough gold', { exact: false })).not.toBeAttached();
  });

  test('shows a toast when recruiting without enough gold', async ({ page }) => {
    await drainGoldToInsufficient(page);
    await page.getByText('Recruit (50g)').click({ force: true });
    await page.clock.fastForward(1); // flush setTimeout(0) toast dispatch

    await expect(page.getByText('Not enough gold', { exact: false })).toBeAttached();
  });

  test('toast can be dismissed by pressing the dismiss button', async ({ page }) => {
    await drainGoldToInsufficient(page);
    await page.getByText('Recruit (50g)').click({ force: true });
    await page.clock.fastForward(1);

    await expect(page.getByText('Not enough gold', { exact: false })).toBeAttached();

    await page.locator('[data-testid^="btn-dismiss-toast-"]').first().click({ force: true });
    await expect(page.getByText('Not enough gold', { exact: false })).not.toBeAttached();
  });

  test('toast auto-dismisses after the duration', async ({ page }) => {
    await drainGoldToInsufficient(page);
    await page.getByText('Recruit (50g)').click({ force: true });
    await page.clock.fastForward(1);

    await expect(page.getByText('Not enough gold', { exact: false })).toBeAttached();

    // Advance past TOAST_DURATION_MS (3000ms)
    await page.clock.fastForward(3100);
    await expect(page.getByText('Not enough gold', { exact: false })).not.toBeAttached();
  });
});
