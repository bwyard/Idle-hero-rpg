/**
 * Quest Workflow E2E tests — generate quests, assign adventurers, complete quests.
 *
 * Tests the full quest lifecycle: generate → assign → tick → complete.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Quest workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('quest board starts empty with placeholder text', async ({ page }) => {
    await expect(page.getByText('Quest Board')).toBeAttached();
    await expect(page.getByText('No quests available', { exact: false })).toBeAttached();
  });

  test('generates quests when "New Quests" is clicked', async ({ page }) => {
    await page.getByText('New Quests').click({ force: true });
    await expect(page.getByText('No quests available', { exact: false })).not.toBeAttached();
    await expect(page.getByText('Available')).toBeAttached();
  });

  test('quest cards show name and assign button', async ({ page }) => {
    await page.getByText('New Quests').click({ force: true });
    await expect(page.getByText('Assign')).toBeAttached();
  });

  test('clicking Assign opens the adventurer picker modal', async ({ page }) => {
    await page.getByText('New Quests').click({ force: true });
    await page.getByText('Assign').first().click({ force: true });
    await expect(page.getByText('Choose Adventurer')).toBeAttached();
    await expect(page.getByText('Select')).toBeAttached();
    await expect(page.getByText('Cancel')).toBeAttached();
  });

  test('can cancel the adventurer picker', async ({ page }) => {
    await page.getByText('New Quests').click({ force: true });
    await page.getByText('Assign').first().click({ force: true });
    await expect(page.getByText('Choose Adventurer')).toBeAttached();

    await page.getByText('Cancel').click({ force: true });
    await expect(page.getByText('Choose Adventurer')).not.toBeAttached();
  });

  test('assigns an adventurer to a quest', async ({ page }) => {
    await page.getByText('New Quests').click({ force: true });
    await expect(page.getByText('Available')).toBeAttached();

    await page.getByText('Assign').first().click({ force: true });
    await expect(page.getByText('Choose Adventurer')).toBeAttached();
    await page.getByText('Select').first().click({ force: true });

    await expect(page.getByText('Choose Adventurer')).not.toBeAttached();
    await expect(page.getByText('In Progress')).toBeAttached();
    await expect(page.getByText('Active')).toBeAttached();
  });

  test('quest completes after enough ticks', async ({ page }) => {
    await page.getByText('New Quests').click({ force: true });
    await expect(page.getByText('Available')).toBeAttached();

    await page.getByText('Assign').first().click({ force: true });
    await expect(page.getByText('Choose Adventurer')).toBeAttached();
    await page.getByText('Select').first().click({ force: true });

    await expect(page.getByText('In Progress')).toBeAttached();

    // PLACEHOLDER_QUEST_DURATION_DAYS=8 × TICKS_PER_DAY=4 = 32 ticks. Click 40 to be safe.
    for (let i = 0; i < 40; i++) {
      await page.getByText('Tick +1').click({ force: true });
    }

    await expect(page.getByText('Completed')).toBeAttached();
    await expect(page.getByText('Done')).toBeAttached();
  });

  test('adventurer picker shows starters when no extra adventurers are recruited', async ({
    page,
  }) => {
    await page.getByText('New Quests').click({ force: true });
    await page.getByText('Assign').first().click({ force: true });
    await expect(page.getByText('Choose Adventurer')).toBeAttached();
    await expect(page.getByText('Select')).toBeAttached();
  });

  test('busy adventurers are excluded from the picker', async ({ page }) => {
    await page.getByText('New Quests').click({ force: true });

    // Assign first starter
    await page.getByText('Assign').first().click({ force: true });
    await page.getByText('Select').first().click({ force: true });

    // Assign second starter if another quest is available
    const secondAssign = page.getByText('Assign').first();
    const hasSecond = (await secondAssign.count()) > 0;
    if (hasSecond) {
      await secondAssign.click({ force: true });
      await page.getByText('Select').first().click({ force: true });

      // If a third quest exists, picker should show no available adventurers
      const thirdAssign = page.getByText('Assign').first();
      const hasThird = (await thirdAssign.count()) > 0;
      if (hasThird) {
        await thirdAssign.click({ force: true });
        await expect(page.getByText('Choose Adventurer')).toBeAttached();
        await expect(page.getByText('No adventurers available')).toBeAttached();
      }
    }
  });
});
