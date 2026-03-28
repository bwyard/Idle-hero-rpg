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
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden.
 * - All clicks need { force: true }.
 * - Toasts auto-dismiss after TOAST_DURATION_MS (3000ms) — use cy.clock()
 *   where needed to prevent race conditions.
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
      // Drain gold to below the overcapacity recruit threshold (75g).
      // Recruit 2 times at 50g (fills dorm to capacity) → gold: 400
      // Recruit 5 more times at 75g (overcapacity)      → gold: 25
      // 8th recruit: needs 75g, has 25g → toast fires.
      const NORMAL_RECRUITS = 2;
      const OVERCAPACITY_RECRUITS = 5;
      const TOTAL_DRAINING_CLICKS = NORMAL_RECRUITS + OVERCAPACITY_RECRUITS;

      for (let i = 0; i < TOTAL_DRAINING_CLICKS; i++) {
        cy.contains('Recruit (50g)').click({ force: true });
        // Small wait for state to update between clicks
        cy.get('[data-testid="stats-gold"]').should('exist');
      }

      // Attempt the failing recruit
      cy.contains('Recruit (50g)').click({ force: true });

      // Toast should appear
      cy.get('[data-testid^="toast-"]').should('exist');
      cy.contains('Not enough gold').should('exist');
    });

    it('toast can be dismissed by pressing the dismiss button', () => {
      // Drain to trigger a toast (same flow as above)
      for (let i = 0; i < 7; i++) {
        cy.contains('Recruit (50g)').click({ force: true });
        cy.get('[data-testid="stats-gold"]').should('exist');
      }
      cy.contains('Recruit (50g)').click({ force: true });

      cy.get('[data-testid^="toast-"]')
        .first()
        .invoke('attr', 'data-testid')
        .then((testId) => {
          const toastId = testId?.replace('toast-', '') ?? '';
          cy.get(`[data-testid="btn-dismiss-toast-${toastId}"]`).click({ force: true });
          cy.get(`[data-testid="toast-${toastId}"]`).should('not.exist');
        });
    });

    it('toast auto-dismisses after the duration', () => {
      for (let i = 0; i < 7; i++) {
        cy.contains('Recruit (50g)').click({ force: true });
        cy.get('[data-testid="stats-gold"]').should('exist');
      }
      cy.contains('Recruit (50g)').click({ force: true });

      cy.get('[data-testid^="toast-"]').should('exist');

      // Advance fake timers past TOAST_DURATION_MS (3000ms)
      cy.tick(3100);

      cy.get('[data-testid^="toast-"]').should('not.exist');
    });
  });
});
