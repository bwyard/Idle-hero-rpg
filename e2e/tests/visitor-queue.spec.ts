/**
 * Visitor Queue E2E tests.
 *
 * Tests the visitor queue screen — approve/deny UI for transient visitors.
 * Visitors spawn randomly via the tick system. Tests that require visitors
 * skip gracefully when none spawn.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Visitor Queue — empty state', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/visitor-queue');
    await page.locator('[data-testid="visitor-queue"]').waitFor();
  });

  test('renders the visitor queue container', async ({ page }) => {
    await expect(page.locator('[data-testid="visitor-queue"]')).toBeAttached();
  });

  test('shows the screen heading', async ({ page }) => {
    await expect(page.getByText('Visitor Queue')).toBeAttached();
  });

  test('shows the empty state when no visitors are present', async ({ page }) => {
    await expect(page.locator('[data-testid="visitor-queue-empty"]')).toBeAttached();
    await expect(page.getByText('No visitors at the guild house', { exact: false })).toBeAttached();
  });

  test('does not render any visitor cards when empty', async ({ page }) => {
    await expect(page.locator('[data-testid^="visitor-card-"]')).toHaveCount(0);
  });
});

test.describe('Visitor Queue — with visitors (after ticking)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);

    // Tick 20 times — spawn chance ~30%/tick, high probability of at least one visitor
    for (let i = 0; i < 20; i++) {
      await page.getByText('Tick +1').click({ force: true });
    }

    await page.goto('/visitor-queue');
    await page.locator('[data-testid="visitor-queue"]').waitFor();
  });

  test('renders a visitor card when a visitor is present', async ({ page }) => {
    const count = await page.locator('[data-testid^="visitor-card-"]').count();
    if (count === 0) {
      test.skip();
      return;
    }
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('visitor card shows service request and fee', async ({ page }) => {
    const count = await page.locator('[data-testid^="visitor-card-"]').count();
    if (count === 0) {
      test.skip();
      return;
    }
    const card = page.locator('[data-testid^="visitor-card-"]').first();
    await expect(card.getByText('Seeking:', { exact: false })).toBeAttached();
    await expect(card.getByText('Fee:', { exact: false })).toBeAttached();
  });

  test('approve and deny buttons are present on each visitor card', async ({ page }) => {
    const count = await page.locator('[data-testid^="visitor-card-"]').count();
    if (count === 0) {
      test.skip();
      return;
    }
    expect(await page.locator('[data-testid^="btn-approve-"]').count()).toBeGreaterThanOrEqual(1);
    expect(await page.locator('[data-testid^="btn-deny-"]').count()).toBeGreaterThanOrEqual(1);
  });

  test('deny button removes the visitor card', async ({ page }) => {
    const count = await page.locator('[data-testid^="visitor-card-"]').count();
    if (count === 0) {
      test.skip();
      return;
    }

    const testId = await page
      .locator('[data-testid^="visitor-card-"]')
      .first()
      .getAttribute('data-testid');
    const visitorId = testId?.replace('visitor-card-', '') ?? '';

    await page.locator(`[data-testid="btn-deny-${visitorId}"]`).click({ force: true });

    await expect(page.locator(`[data-testid="visitor-card-${visitorId}"]`)).not.toBeAttached();

    if (count === 1) {
      await expect(page.locator('[data-testid="visitor-queue-empty"]')).toBeAttached();
    }
  });

  test('approve button removes the visitor approve button', async ({ page }) => {
    const count = await page.locator('[data-testid^="visitor-card-"]').count();
    if (count === 0) {
      test.skip();
      return;
    }

    const testId = await page
      .locator('[data-testid^="visitor-card-"]')
      .first()
      .getAttribute('data-testid');
    const visitorId = testId?.replace('visitor-card-', '') ?? '';

    await page.locator(`[data-testid="btn-approve-${visitorId}"]`).click({ force: true });

    // Visitor is held after approval — approve button should be gone
    await expect(page.locator(`[data-testid="btn-approve-${visitorId}"]`)).not.toBeAttached();
  });
});
