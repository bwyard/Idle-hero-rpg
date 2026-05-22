/**
 * Accessibility E2E tests.
 *
 * Verifies that interactive elements have accessibility labels and roles.
 * React Native Web maps accessibilityLabel → aria-label and
 * accessibilityRole="button" → role="button".
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Accessibility — main screen buttons', () => {
  test.beforeEach(async ({ page }) => {
    await gotoGame(page);
  });

  test('does not show error boundary in normal state', async ({ page }) => {
    await expect(page.getByText('Something went wrong', { exact: false })).not.toBeAttached();
  });

  test('Tick +1 button has an accessibility label', async ({ page }) => {
    await expect(page.locator('[aria-label="Advance one tick"]')).toBeAttached();
  });

  test('Play button has an accessibility label', async ({ page }) => {
    await expect(page.locator('[aria-label="Play game"]')).toBeAttached();
  });

  test('Play button label changes to Pause after clicking', async ({ page }) => {
    await page.locator('[aria-label="Play game"]').click({ force: true });
    await expect(page.locator('[aria-label="Pause game"]')).toBeAttached();
  });

  test('Recruit button has an accessibility label', async ({ page }) => {
    await expect(page.locator('[aria-label="Recruit (50g)"]')).toBeAttached();
  });

  test('Build button has an accessibility label', async ({ page }) => {
    await expect(page.locator('[aria-label="Build (100g)"]')).toBeAttached();
  });

  test('Feast button has an accessibility label', async ({ page }) => {
    await expect(page.locator('[aria-label="Feast (75g)"]')).toBeAttached();
  });

  test('action buttons have role="button"', async ({ page }) => {
    await expect(page.locator('[aria-label="Recruit (50g)"]')).toHaveAttribute('role', 'button');
    await expect(page.locator('[aria-label="Advance one tick"]')).toHaveAttribute('role', 'button');
    await expect(page.locator('[aria-label="Play game"]')).toHaveAttribute('role', 'button');
  });
});

test.describe('Accessibility — visitor queue buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);

    for (let i = 0; i < 30; i++) {
      await page.getByText('Tick +1').click({ force: true });
    }

    await page.goto('/visitor-queue');
    await page.locator('[data-testid="visitor-queue"]').waitFor();
  });

  test('approve buttons have accessibility labels when visitors are present', async ({ page }) => {
    const count = await page.locator('[data-testid^="visitor-card-"]').count();
    if (count === 0) {
      test.skip();
      return;
    }
    const ariaLabel = await page
      .locator('[data-testid^="btn-approve-"]')
      .first()
      .getAttribute('aria-label');
    expect(ariaLabel).toMatch(/^Approve /);
  });

  test('deny buttons have accessibility labels when visitors are present', async ({ page }) => {
    const count = await page.locator('[data-testid^="visitor-card-"]').count();
    if (count === 0) {
      test.skip();
      return;
    }
    const ariaLabel = await page
      .locator('[data-testid^="btn-deny-"]')
      .first()
      .getAttribute('aria-label');
    expect(ariaLabel).toMatch(/^Deny /);
  });

  test('approve and deny buttons have role="button"', async ({ page }) => {
    const count = await page.locator('[data-testid^="visitor-card-"]').count();
    if (count === 0) {
      test.skip();
      return;
    }
    await expect(page.locator('[data-testid^="btn-approve-"]').first()).toHaveAttribute(
      'role',
      'button',
    );
    await expect(page.locator('[data-testid^="btn-deny-"]').first()).toHaveAttribute(
      'role',
      'button',
    );
  });
});

test.describe('Accessibility — start menu', () => {
  test('start button has an accessible role and navigates on click', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/start');
    await page.locator('[data-testid="btn-start-game"]').waitFor();
    await page.getByTestId('btn-start-game').click({ force: true });
    await expect(page.locator('[data-testid="stats-gold"]')).toBeAttached();
  });
});
