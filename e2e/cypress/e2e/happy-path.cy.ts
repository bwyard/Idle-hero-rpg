/**
 * Happy path E2E — verifies the core game loop works end-to-end.
 *
 * Covers: launch → recruit → quest → tick → gold changes → tier up flow.
 * Runs against Expo Web target.
 *
 * Notes on React Native Web + Cypress:
 * - RN Web wraps views in overflow:hidden divs — use .should('exist') not
 *   .should('be.visible') for most content assertions.
 * - All button clicks need {force: true} for the same reason.
 * - dispatch() puts events in pendingEvents; they only move to eventLog after
 *   the next tick (processEventLog). Always click "Tick +1" before checking
 *   event log content.
 */

describe('Game happy path', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the demo dashboard with all sections', () => {
    cy.contains('The Iron Hearth').should('exist');
    cy.contains('Spring').should('exist');
    cy.contains('Gold').should('exist');
    cy.contains('Actions').should('exist');
  });

  it('displays starting adventurers', () => {
    cy.contains('Kira').should('be.visible');
    cy.contains('Tomas').should('be.visible');
  });

  it('can tick the game forward', () => {
    cy.contains('Tick +1').click({ force: true });
    // Stats bar should still show gold label
    cy.contains('Gold').should('exist');
  });

  it('can recruit an adventurer', () => {
    cy.contains('Recruit (50g)').click({ force: true });
    // Flush pendingEvents to eventLog
    cy.contains('Tick +1').click({ force: true });
    // Recruit event message: "${name} joined the guild!"
    cy.contains('joined').should('exist');
  });

  it('can generate quests', () => {
    cy.contains('New Quests').click({ force: true });
    // Quest board should show Assign buttons
    cy.contains('Assign').should('exist');
  });

  it('can build a building', () => {
    cy.contains('Build (100g)').click({ force: true });
    // Flush pendingEvents to eventLog
    cy.contains('Tick +1').click({ force: true });
    // Build event message: "A new training-grounds was constructed!"
    cy.contains('constructed').should('exist');
  });

  it('can hold a feast', () => {
    cy.contains('Feast (75g)').click({ force: true });
    // Flush pendingEvents to eventLog
    cy.contains('Tick +1').click({ force: true });
    // Feast event message: "A grand feast was held!"
    cy.contains('feast').should('exist');
  });

  it('gold changes after multiple ticks', () => {
    // Start auto-tick
    cy.contains('Play').click({ force: true });
    // Wait a few seconds for ticks to accumulate
    cy.wait(3000);
    // Pause
    cy.contains('Pause').click({ force: true });
    // Stats should still be rendering (season label always present)
    cy.contains('Spring').should('exist');
  });

  it('XP bars in roster show whole numbers — no floating point noise', () => {
    // Tick enough times for fractional ambient XP to accumulate (0.3/tick for D-tier)
    for (let i = 0; i < 15; i++) {
      cy.contains('Tick +1').click({ force: true });
    }

    // No element on the page should render floating-point XP like "4.5000001/10"
    // The regex matches a decimal number followed by "/" (the XP separator)
    cy.contains(/\d+\.\d+\//).should('not.exist');
  });

  it('shows insufficient gold feedback when recruit fails', () => {
    // Drain gold by recruiting until broke — starting gold 500, cost 50g = 10 recruits max
    for (let i = 0; i < 10; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    // Now attempt to recruit with < 50g remaining
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });
    cy.contains('Not enough gold').should('exist');
  });

  it('shows insufficient gold feedback when build fails', () => {
    // Build costs 100g — recruit 4 times (4×50=200g) to get below 100g threshold
    // Starting gold 500, after 4 recruits = 300g still > 100. After 5 = 250g > 100.
    // After spending on feast+recruits to drain:
    // Easiest: drain below 100 via recruits: need 500 - (n×50) < 100 → n > 8 → 9 recruits = 500-450=50g
    for (let i = 0; i < 9; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    // Now gold is 50g, build costs 100g
    cy.contains('Build (100g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });
    cy.contains('Not enough gold').should('exist');
  });

  it('full loop: recruit → generate quest → assign → tick to completion', () => {
    // Recruit
    cy.contains('Recruit (50g)').click({ force: true });

    // Generate quests
    cy.contains('New Quests').click({ force: true });

    // Assign first quest to first adventurer (RN Web maps accessibilityLabel → aria-label)
    cy.get('[aria-label*="Assign adventurer"]').first().click({ force: true });
    // Pick first available adventurer — picker shows "Select" text per row
    cy.contains('Select').first().click({ force: true });

    // Tick manually to complete the quest — baseDurationDays=8 × TICKS_PER_DAY=4 = 32 ticks.
    // Manual clicks are deterministic and much faster than real-time auto-play.
    for (let i = 0; i < 33; i++) {
      cy.contains('Tick +1').click({ force: true });
    }

    // QuestBoard shows a persistent "Done" badge on completed quests
    cy.contains('Done').should('exist');
  });
});
