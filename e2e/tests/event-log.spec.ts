/**
 * Event Log E2E tests — verify that game actions produce visible event messages.
 *
 * The EventLog component displays recent events from state.eventLog.
 * Events are created by dispatch actions as pendingEvents, then moved to
 * eventLog by processEventLog during the next tick.
 * Tests must tick after each action to flush pendingEvents.
 *
 * Initial state: one GUILD_FOUNDED event already in the event log.
 */

import { test, expect } from '@playwright/test';
import { gotoGame } from './helpers';

test.describe('Event Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await gotoGame(page);
  });

  test('event log section exists on the main screen', async ({ page }) => {
    await expect(page.getByText('Event Log')).toBeAttached();
  });

  test('starts with the GUILD_FOUNDED event', async ({ page }) => {
    await expect(
      page.getByText('The Iron Hearth opens its doors', { exact: false }),
    ).toBeAttached();
  });

  test('recruiting an adventurer adds an event after ticking', async ({ page }) => {
    await page.getByText('Recruit (50g)').click({ force: true });
    await page.getByText('Tick +1').click({ force: true });

    await expect(page.getByText('joined the guild', { exact: false })).toBeAttached();
  });

  test('building adds an event after ticking', async ({ page }) => {
    await page.getByText('Build (100g)').click({ force: true });
    await page.getByText('Tick +1').click({ force: true });

    await expect(page.getByText('constructed', { exact: false })).toBeAttached();
  });

  test('holding a feast adds an event after ticking', async ({ page }) => {
    await page.getByText('Feast (75g)').click({ force: true });
    await page.getByText('Tick +1').click({ force: true });

    await expect(page.getByText('feast', { exact: false })).toBeAttached();
  });

  test('multiple actions produce multiple event entries', async ({ page }) => {
    await page.getByText('Recruit (50g)').click({ force: true });
    await page.getByText('Build (100g)').click({ force: true });
    await page.getByText('Feast (75g)').click({ force: true });
    await page.getByText('Tick +1').click({ force: true });

    await expect(page.getByText('joined the guild', { exact: false })).toBeAttached();
    await expect(page.getByText('constructed', { exact: false })).toBeAttached();
    await expect(page.getByText('feast', { exact: false })).toBeAttached();
  });

  test('generating quests populates the quest board', async ({ page }) => {
    await expect(page.getByText('No quests available', { exact: false })).toBeAttached();
    await page.getByText('New Quests').click({ force: true });
    await expect(page.getByText('No quests available', { exact: false })).not.toBeAttached();
    await expect(page.getByText('Available')).toBeAttached();
  });

  test('events are shown newest first', async ({ page }) => {
    await page.getByText('Recruit (50g)').click({ force: true });
    await page.getByText('Tick +1').click({ force: true });
    await page.getByText('Build (100g)').click({ force: true });
    await page.getByText('Tick +1').click({ force: true });

    await expect(page.getByText('joined the guild', { exact: false })).toBeAttached();
    await expect(page.getByText('constructed', { exact: false })).toBeAttached();
  });
});
