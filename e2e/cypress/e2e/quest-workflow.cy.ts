/**
 * Quest Workflow E2E tests — generate quests, assign adventurers, complete quests.
 *
 * Tests the full quest lifecycle: generate → assign → tick → complete.
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden
 *   prevents Cypress visibility checks on inner views.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 * - Quest assignment opens an AdventurerPicker modal, then selecting an
 *   adventurer dispatches START_QUEST.
 */

describe('Quest workflow', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('quest board starts empty with placeholder text', () => {
    cy.contains('Quest Board').should('exist');
    cy.contains('No quests available').should('exist');
  });

  it('generates quests when "New Quests" is clicked', () => {
    cy.contains('New Quests').click({ force: true });

    // The placeholder should be replaced by quest cards
    cy.contains('No quests available').should('not.exist');
    cy.contains('Available').should('exist');
  });

  it('quest cards show name, description, and assign button', () => {
    cy.contains('New Quests').click({ force: true });

    // At least one quest should have an Assign button
    cy.contains('Assign').should('exist');

    // Quest cards show tick duration
    cy.contains('ticks').should('exist');
  });

  it('clicking Assign opens the adventurer picker modal', () => {
    // Need an adventurer first to see them in the picker
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('New Quests').click({ force: true });

    // Click the first Assign button
    cy.contains('Assign').first().click({ force: true });

    // The adventurer picker modal should appear
    cy.contains('Choose Adventurer').should('exist');
    cy.contains('Select').should('exist');
    cy.contains('Cancel').should('exist');
  });

  it('can cancel the adventurer picker', () => {
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('New Quests').click({ force: true });

    cy.contains('Assign').first().click({ force: true });
    cy.contains('Choose Adventurer').should('exist');

    cy.contains('Cancel').click({ force: true });

    // Modal should close
    cy.contains('Choose Adventurer').should('not.exist');
  });

  it('assigns an adventurer to a quest', () => {
    // Recruit an adventurer
    cy.contains('Recruit (50g)').click({ force: true });

    // Generate quests
    cy.contains('New Quests').click({ force: true });
    cy.contains('Available').should('exist');

    // Click Assign on the first quest
    cy.contains('Assign').first().click({ force: true });
    cy.contains('Choose Adventurer').should('exist');

    // Select the first (and only) adventurer
    cy.contains('Select').first().click({ force: true });

    // The modal should close
    cy.contains('Choose Adventurer').should('not.exist');

    // Quest should now show as in progress
    cy.contains('In Progress').should('exist');
    cy.contains('Active').should('exist');
  });

  it('quest completes after enough ticks', () => {
    // Recruit an adventurer
    cy.contains('Recruit (50g)').click({ force: true });

    // Generate quests
    cy.contains('New Quests').click({ force: true });
    cy.contains('Available').should('exist');

    // Assign adventurer to a quest
    cy.contains('Assign').first().click({ force: true });
    cy.contains('Choose Adventurer').should('exist');
    cy.contains('Select').first().click({ force: true });

    // Quest is now in progress
    cy.contains('In Progress').should('exist');

    // Tick forward enough times to complete the quest.
    // PLACEHOLDER_QUEST_DURATION_DAYS=8 × TICKS_PER_DAY=4 = 32 ticks per quest.
    // Tick 40 times to ensure completion.
    for (let i = 0; i < 40; i++) {
      cy.contains('Tick +1').click({ force: true });
    }

    // After enough ticks, the quest should appear in the Completed section
    cy.contains('Completed').should('exist');
    cy.contains('Done').should('exist');
  });

  it('adventurer picker shows empty when no adventurers are available', () => {
    // Generate quests without recruiting anyone first
    cy.contains('New Quests').click({ force: true });
    cy.contains('Assign').first().click({ force: true });

    cy.contains('Choose Adventurer').should('exist');
    cy.contains('No adventurers available').should('exist');
  });

  it('busy adventurers are excluded from the picker', () => {
    // Recruit one adventurer
    cy.contains('Recruit (50g)').click({ force: true });

    // Generate quests (need at least 2 for this test)
    cy.contains('New Quests').click({ force: true });

    // Assign the adventurer to the first quest
    cy.contains('Assign').first().click({ force: true });
    cy.contains('Select').first().click({ force: true });

    // Try to assign a second quest — the picker should show no available adventurers
    // (only if there's another unassigned quest)
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Assign")').length > 0) {
        cy.contains('Assign').first().click({ force: true });
        cy.contains('Choose Adventurer').should('exist');
        cy.contains('No adventurers available').should('exist');
      }
    });
  });
});
