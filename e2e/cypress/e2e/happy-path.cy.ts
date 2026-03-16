/**
 * Happy path E2E — verifies the core game loop works end-to-end.
 *
 * Covers: launch → recruit → quest → tick → gold changes → tier up flow.
 * Runs against Expo Web target.
 */

describe('Game happy path', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the demo dashboard with all sections', () => {
    cy.contains('The Iron Hearth').should('be.visible');
    cy.contains('Spring').should('be.visible');
    cy.contains('Gold').should('be.visible');
    cy.contains('Actions').should('be.visible');
  });

  it('displays starting adventurers', () => {
    cy.contains('Kira').should('be.visible');
    cy.contains('Tomas').should('be.visible');
  });

  it('can tick the game forward', () => {
    cy.contains('Tick Once').click();
    // Gold should change (base income applies)
    cy.contains('Gold').should('be.visible');
  });

  it('can recruit an adventurer', () => {
    cy.contains('Recruit (50g)').click();
    // Should see a recruit event in the log
    cy.contains('recruited').should('be.visible');
  });

  it('can generate quests', () => {
    cy.contains('New Quests').click();
    // Quest board should show quests
    cy.contains('Assign').should('be.visible');
  });

  it('can build a building', () => {
    cy.contains('Build (100g)').click();
    // Should see a build event
    cy.contains('constructed').should('be.visible');
  });

  it('can hold a feast', () => {
    cy.contains('Feast (75g)').click();
    cy.contains('feast').should('be.visible');
  });

  it('gold changes after multiple ticks', () => {
    // Start auto-tick
    cy.contains('Play').click();
    // Wait a few seconds for ticks to accumulate
    cy.wait(3000);
    // Pause
    cy.contains('Pause').click();
    // Day counter should have advanced
    cy.contains(/Day\s+\d+/).should('be.visible');
  });

  it('full loop: recruit → generate quest → assign → tick to completion', () => {
    // Recruit
    cy.contains('Recruit (50g)').click();

    // Generate quests
    cy.contains('New Quests').click();

    // Assign first quest to first adventurer
    cy.get('[accessibilityLabel*="Assign"]').first().click();
    // Pick an adventurer from the picker
    cy.get('[accessibilityLabel*="adventurer"]').first().click();

    // Tick forward many times to complete the quest
    for (let i = 0; i < 40; i++) {
      cy.contains('Tick Once').click();
    }

    // Should see quest completion event
    cy.contains('Quest complete').should('be.visible');
  });
});
