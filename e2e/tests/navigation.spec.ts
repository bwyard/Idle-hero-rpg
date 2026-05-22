/**
 * Navigation E2E tests — splash screen and start menu.
 *
 * Tests the flow: /splash → /start → /(tabs)
 *
 * Notes:
 * - Splash auto-navigates after 2200ms.
 * - page.clock.install() freezes timers before navigation so tests that
 *   don't want auto-navigation can control time.
 * - Use toBeAttached() for elements that may be clipped by RN Web overflow:hidden.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Splash screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/splash');
    await page.locator('[data-testid="splash-screen"]').waitFor();
  });

  test('renders the splash screen', async ({ page }) => {
    await expect(page.locator('[data-testid="splash-screen"]')).toBeAttached();
  });

  test('shows the game title', async ({ page }) => {
    await expect(page.locator('[data-testid="splash-title"]')).toBeAttached();
    await expect(page.getByText("Retired Hero's Guild")).toBeAttached();
  });

  test('shows the crest symbol', async ({ page }) => {
    await expect(page.locator('[data-testid="splash-crest"]')).toBeAttached();
  });

  test('shows the tagline', async ({ page }) => {
    await expect(page.locator('[data-testid="splash-subtitle"]')).toBeAttached();
  });

  test('auto-navigates away from splash after the duration', async ({ page }) => {
    // Let real time run — splash auto-navigates after 2200ms
    await page.clock.uninstall();
    await page.goto('/splash');
    await page.locator('[data-testid="splash-screen"]').waitFor();
    await expect(page.locator('[data-testid="splash-screen"]')).not.toBeAttached({ timeout: 5000 });
  });
});

test.describe('Start menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/start');
    await page.locator('[data-testid="start-menu"]').waitFor();
  });

  test('renders the start menu', async ({ page }) => {
    await expect(page.locator('[data-testid="start-menu"]')).toBeAttached();
  });

  test('shows the game title', async ({ page }) => {
    await expect(page.locator('[data-testid="start-menu-title"]')).toBeAttached();
    await expect(page.getByText("Retired Hero's Guild")).toBeAttached();
  });

  test('has a start button', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-start-game"]')).toBeAttached();
  });

  test('navigates to the game when start button is pressed', async ({ page }) => {
    await page.getByTestId('btn-start-game').click({ force: true });
    await expect(page.locator('[data-testid="stats-gold"]')).toBeAttached();
  });
});

test.describe('Game loads', () => {
  test('main game screen loads after start flow', async ({ page }) => {
    await gotoGame(page);
    await expect(page.locator('[data-testid="stats-gold"]')).toBeAttached();
  });
});
