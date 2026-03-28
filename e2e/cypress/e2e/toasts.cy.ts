/**
 * Toast notification E2E tests.
 *
 * Tests the ToastStack component rendered in the main game screen.
 * Toasts fire when a dispatch action is a no-op (e.g. insufficient gold).
 *
 * Gold math (starting state):
 *   - Starting gold: 500
 *   - 2 starter adventurers already in dorm (dorm 2/4)
 *   - Recruits 1–2: 50g each (fills dorm 3/4 and 4/4)  →  gold: 400
 *   - Recruits 3–7: 75g each (overcapacity surcharge)   →  gold: 25
 *   - Recruit 8:    needs 75g, has 25g → no-op → toast
 *
 * IMPORTANT: Toast dispatch uses setTimeout(0) to avoid Zustand re-entrancy.
 * With cy.clock() active, cy.tick(1) must be called after the failing action
 * to flush the deferred toast.
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden.
 * - All clicks need { force: true }.
 */

describe('Toast notifications', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('toast-stack container is present in the DOM', () => {
    cy.get('[data-testid="toast-stack"]').should('exist');
  });

  it('no toasts are shown on initial load', () => {
    cy.contains('Not enough gold').should('not.exist');
  });

  describe('insufficient gold toast', () => {
    it('shows a toast when recruiting without enough gold', () => {
      // Drain gold: 2 at 50g + 5 at 75g = 25g remaining
      for (let i = 0; i < 7; i++) {
        cy.contains('Recruit (50g)').click({ force: true });
        cy.get('[data-testid="stats-gold"]').should('exist');
      }

      // Attempt the failing recruit (needs 75g, has 25g)
      cy.contains('Recruit (50g)').click({ force: true });
      // Flush setTimeout(0) used by gameStore to fire the toast
      cy.tick(1);

      cy.contains('Not enough gold').should('exist');
    });

    it('toast can be dismissed by pressing the dismiss button', () => {
      for (let i = 0; i < 7; i++) {
        cy.contains('Recruit (50g)').click({ force: true });
        cy.get('[data-testid="stats-gold"]').should('exist');
      }
      cy.contains('Recruit (50g)').click({ force: true });
      cy.tick(1);

      cy.contains('Not enough gold').should('exist');

      cy.get('[data-testid^="btn-dismiss-toast-"]').first().click({ force: true });
      cy.contains('Not enough gold').should('not.exist');
    });

    it('toast auto-dismisses after the duration', () => {
      for (let i = 0; i < 7; i++) {
        cy.contains('Recruit (50g)').click({ force: true });
        cy.get('[data-testid="stats-gold"]').should('exist');
      }
      cy.contains('Recruit (50g)').click({ force: true });
      cy.tick(1);

      cy.contains('Not enough gold').should('exist');

      // Advance past TOAST_DURATION_MS (3000ms)
      cy.tick(3100);

      cy.contains('Not enough gold').should('not.exist');
    });
  });
});
