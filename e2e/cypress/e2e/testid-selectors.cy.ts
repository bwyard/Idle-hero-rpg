/**
 * testID selector smoke tests — verifies that data-testid attributes are
 * present and hold correct values.
 *
 * These tests exist to validate the testID strategy: where text/role selectors
 * cannot target a specific value (e.g. gold amount, tick count, per-adventurer
 * XP), data-testid attributes on Text nodes give Cypress a stable, precise
 * handle that is independent of layout or CSS class names.
 *
 * RN Web maps testID → data-testid in the DOM.
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden
 *   prevents Cypress visibility checks on inner views.
 * - All clicks need { force: true } for the same reason.
 */

describe('testID selectors', () => {
  beforeEach(() => {
    cy.visit('/');
    // Gate on app mount before interacting — prevents Expo Router race conditions
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  describe('stats-gold', () => {
    it('shows starting gold of 500', () => {
      cy.get('[data-testid="stats-gold"]').should('have.text', '500');
    });

    it('decreases after a recruit action', () => {
      cy.contains('Recruit (50g)').click({ force: true });
      // Gold drops from 500 to 450
      cy.get('[data-testid="stats-gold"]').should('have.text', '450');
    });
  });

  describe('tick-count', () => {
    it('starts at 0', () => {
      cy.get('[data-testid="tick-count"]').should('have.text', '0');
    });

    it('increments after Tick +1', () => {
      cy.contains('Tick +1').click({ force: true });
      cy.get('[data-testid="tick-count"]').should('have.text', '1');
    });

    it('increments correctly after multiple ticks', () => {
      for (let i = 0; i < 5; i++) {
        cy.contains('Tick +1').click({ force: true });
      }
      cy.get('[data-testid="tick-count"]').should('have.text', '5');
    });
  });

  describe('xp-{id} per-adventurer XP', () => {
    it('renders XP text for each starter adventurer', () => {
      // Starter adventurers have known names; we can assert their XP nodes exist
      // without knowing the exact ID — just verify at least 2 xp-* nodes appear
      cy.get('[data-testid^="xp-"]').should('have.length.gte', 2);
    });

    it('XP text contains a "/" separator', () => {
      cy.get('[data-testid^="xp-"]').each(($el) => {
        expect($el.text()).to.include('/');
      });
    });
  });
});
