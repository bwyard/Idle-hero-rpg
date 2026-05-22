/**
 * Tick System E2E tests — tick counter, manual tick button,
 * play/pause toggle, and game state progression.
 *
 * Starting gold: 500. Base passive income: 2 gold/tick.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Tick System — manual ticking', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('tick count starts at 0', async ({ page }) => {
    await expect(page.locator('[data-testid="tick-count"]')).toHaveText('0');
  });

  test('clicking Tick +1 increments the tick count by 1', async ({ page }) => {
    await page.getByText('Tick +1').click({ force: true });
    await expect(page.locator('[data-testid="tick-count"]')).toHaveText('1');
  });

  test('clicking Tick +1 multiple times increments correctly', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.getByText('Tick +1').click({ force: true });
    }
    await expect(page.locator('[data-testid="tick-count"]')).toHaveText('5');
  });

  test('gold increases from passive income after ticking', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-gold"]')).toContainText('500');

    for (let i = 0; i < 10; i++) {
      await page.getByText('Tick +1').click({ force: true });
    }

    const gold = parseInt(
      (await page.locator('[data-testid="stats-gold"]').textContent()) ?? '0',
      10,
    );
    expect(gold).toBeGreaterThan(500);
  });
});

test.describe('Tick System — play/pause toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('Play button exists initially', async ({ page }) => {
    await expect(page.getByText('Play')).toBeAttached();
  });

  test('clicking Play changes the button text to Pause', async ({ page }) => {
    await page.getByText('Play').click({ force: true });
    await expect(page.getByText('Pause')).toBeAttached();
  });

  test('clicking Pause changes the button text back to Play', async ({ page }) => {
    await page.getByText('Play').click({ force: true });
    await expect(page.getByText('Pause')).toBeAttached();
    await page.getByText('Pause').click({ force: true });
    await expect(page.getByText('Play')).toBeAttached();
  });

  test('auto-ticking advances the tick count when playing', async ({ page }) => {
    await expect(page.locator('[data-testid="tick-count"]')).toHaveText('0');

    await page.getByText('Play').click({ force: true });

    // Advance fake clock by 5.5 seconds (tick interval is 1000ms)
    await page.clock.fastForward(5500);

    const ticks = parseInt(
      (await page.locator('[data-testid="tick-count"]').textContent()) ?? '0',
      10,
    );
    expect(ticks).toBeGreaterThan(0);
  });
});

test.describe('Tick System — calendar progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('starts at Year 1', async ({ page }) => {
    await expect(page.getByText('Y1')).toBeAttached();
  });

  test('day counter advances after ticking (4 ticks = 1 day)', async ({ page }) => {
    await expect(page.getByText(/1\/365/)).toBeAttached();

    for (let i = 0; i < 4; i++) {
      await page.getByText('Tick +1').click({ force: true });
    }

    await expect(page.getByText(/2\/365/)).toBeAttached();
  });

  test('season is displayed', async ({ page }) => {
    await expect(page.getByText('Spring')).toBeAttached();
  });
});
