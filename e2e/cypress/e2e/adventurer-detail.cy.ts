/**
 * Adventurer detail page E2E — verifies the /adventurer/:id route.
 *
 * Covers: navigation, stats display, XP shown as whole numbers,
 * idle status, and back navigation.
 */

describe('Adventurer detail page', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for Expo Router to fully mount before interacting — prevents
    // "navigate before mounting Root Layout" error on rapid test transitions
    cy.contains('Adventurer Roster').should('exist');
  });

  it('navigates to adventurer detail when roster row is tapped', () => {
    cy.contains('Kira').click({ force: true });
    cy.contains('Stats').should('exist');
    cy.contains('Milestones').should('exist');
    cy.contains('Status').should('exist');
  });

  it('shows adventurer name and tier on detail page', () => {
    cy.contains('Kira').click({ force: true });
    cy.contains('Kira').should('exist');
    // Tier badge shows tier letter
    cy.contains('F').should('exist');
  });

  it('shows archetype on detail page', () => {
    cy.contains('Kira').click({ force: true });
    cy.contains('Fighter').should('exist');
  });

  it('shows idle status when adventurer is not on a quest', () => {
    cy.contains('Kira').click({ force: true });
    cy.contains('Idle at guild').should('exist');
  });

  it('XP display is a whole number — no floating point noise', () => {
    // Tick to accumulate fractional ambient XP (F-tier rate is 0.5/tick)
    for (let i = 0; i < 10; i++) {
      cy.contains('Tick +1').click({ force: true });
    }

    cy.contains('Kira').click({ force: true });

    // No text on the detail page should show "36.300000001 / 50" style float noise
    cy.contains(/\d+\.\d+\s*\//).should('not.exist');
  });

  it('shows on-quest status when adventurer is assigned', () => {
    // Generate quests then assign Kira
    cy.contains('New Quests').click({ force: true });
    cy.get('[aria-label*="Assign adventurer"]').first().click({ force: true });
    cy.contains('Select').first().click({ force: true });

    // Navigate to Kira's detail
    cy.contains('Kira').click({ force: true });
    cy.contains('On Quest').should('exist');
  });

  it('shows "No milestones yet" when adventurer has no milestones', () => {
    cy.contains('Kira').click({ force: true });
    cy.contains('No milestones yet').should('exist');
  });
});
