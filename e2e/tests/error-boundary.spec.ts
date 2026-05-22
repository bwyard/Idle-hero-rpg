/**
 * Error Boundary E2E tests.
 *
 * Verifies the ErrorBoundary component does not interfere with normal rendering.
 * The "Something went wrong" fallback only appears when a render error occurs.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Error Boundary — normal operation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoGame(page);
  });

  test('does not show the error boundary fallback on the main screen', async ({ page }) => {
    await expect(page.getByText('Something went wrong', { exact: false })).not.toBeAttached();
  });

  test('does not show the Restart button on the main screen', async ({ page }) => {
    await expect(page.getByText('Restart')).not.toBeAttached();
  });

  test('renders the main game content normally', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-gold"]')).toBeAttached();
    await expect(page.locator('[data-testid="tick-count"]')).toBeAttached();
    await expect(page.getByText("Retired Hero's Guild")).toBeAttached();
  });
});

test.describe('Error Boundary — does not interfere with navigation', () => {
  test('splash screen renders without error boundary interference', async ({ page }) => {
    await page.clock.install();
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/splash');
    await page.locator('[data-testid="splash-screen"]').waitFor();
    await expect(page.getByText('Something went wrong', { exact: false })).not.toBeAttached();
  });

  test('start menu renders without error boundary interference', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/start');
    await page.locator('[data-testid="start-menu"]').waitFor();
    await expect(page.getByText('Something went wrong', { exact: false })).not.toBeAttached();
  });

  test('visitor queue renders without error boundary interference', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/visitor-queue');
    await page.locator('[data-testid="visitor-queue"]').waitFor();
    await expect(page.getByText('Something went wrong', { exact: false })).not.toBeAttached();
  });
});
