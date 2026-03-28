/**
 * Error Boundary E2E tests.
 *
 * Verifies the ErrorBoundary component does not interfere with normal
 * rendering. The ErrorBoundary wraps the entire app in _layout.tsx and
 * shows a "Something went wrong" fallback only when a render error occurs.
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden
 *   breaks Cypress visibility checks.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 */

describe('Error Boundary — normal operation', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.tick(2500);
    cy.get('[data-testid="btn-start-game"]').should('exist').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('does not show the error boundary fallback on the main screen', () => {
    // The error boundary fallback shows "Something went wrong" — it should not be present
    cy.contains('Something went wrong').should('not.exist');
  });

  it('does not show the Restart button on the main screen', () => {
    // The Restart button only appears in the error boundary fallback
    cy.contains('Restart').should('not.exist');
  });

  it('renders the main game content normally', () => {
    // Guild header, stats bar, and tick controls should all be present
    cy.get('[data-testid="stats-gold"]').should('exist');
    cy.get('[data-testid="tick-count"]').should('exist');
    cy.contains("Retired Hero's Guild").should('exist');
  });
});

describe('Error Boundary — does not interfere with navigation', () => {
  it('splash screen renders without error boundary interference', () => {
    cy.clock();
    cy.visit('/splash');
    cy.get('[data-testid="splash-screen"]').should('exist');
    cy.contains('Something went wrong').should('not.exist');
  });

  it('start menu renders without error boundary interference', () => {
    cy.visit('/start');
    cy.get('[data-testid="start-menu"]').should('exist');
    cy.contains('Something went wrong').should('not.exist');
  });

  it('visitor queue renders without error boundary interference', () => {
    cy.visit('/visitor-queue');
    cy.get('[data-testid="visitor-queue"]').should('exist');
    cy.contains('Something went wrong').should('not.exist');
  });
});
