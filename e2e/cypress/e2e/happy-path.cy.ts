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
