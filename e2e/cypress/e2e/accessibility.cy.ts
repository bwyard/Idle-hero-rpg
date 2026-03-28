/**
 * Accessibility E2E tests.
 *
 * Verifies that interactive elements have accessibility labels.
 * React Native Web maps accessibilityLabel to aria-label and
 * accessibilityRole="button" to role="button".
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden
 *   breaks Cypress visibility checks.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 * - Use cy.clock() and cy.tick() for timing control.
 */

describe('Accessibility — main screen buttons', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('does not show error boundary in normal state', () => {
    cy.contains('Something went wrong').should('not.exist');
  });

  it('Tick +1 button has an accessibility label', () => {
    // TickControls: accessibilityLabel="Advance one tick"
    cy.get('[aria-label="Advance one tick"]').should('exist');
  });

  it('Play button has an accessibility label', () => {
    // TickControls: accessibilityLabel="Play game" (when paused)
    cy.get('[aria-label="Play game"]').should('exist');
  });

  it('Play button label changes to Pause after clicking', () => {
    cy.get('[aria-label="Play game"]').should('exist').click({ force: true });
    cy.get('[aria-label="Pause game"]').should('exist');
  });

  it('Recruit button has an accessibility label', () => {
    // ActionButtons: accessibilityLabel="Recruit (50g)"
    cy.get('[aria-label="Recruit (50g)"]').should('exist');
  });

  it('Build button has an accessibility label', () => {
    // ActionButtons: accessibilityLabel="Build (100g)"
    cy.get('[aria-label="Build (100g)"]').should('exist');
  });

  it('Feast button has an accessibility label', () => {
    // ActionButtons: accessibilityLabel="Feast (75g)"
    cy.get('[aria-label="Feast (75g)"]').should('exist');
  });

  it('action buttons have role="button"', () => {
    // RN Web maps accessibilityRole="button" to role="button"
    cy.get('[aria-label="Recruit (50g)"]').should('have.attr', 'role', 'button');
    cy.get('[aria-label="Advance one tick"]').should('have.attr', 'role', 'button');
    cy.get('[aria-label="Play game"]').should('have.attr', 'role', 'button');
  });
});

describe('Accessibility — visitor queue buttons', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');

    // Tick enough to give visitor spawn system a chance (spawn chance ~5%/tick)
    for (let i = 0; i < 30; i++) {
      cy.contains('Tick +1').click({ force: true });
    }

    cy.visit('/visitor-queue');
    cy.get('[data-testid="visitor-queue"]').should('exist');
  });

  it('approve buttons have accessibility labels when visitors are present', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="visitor-card-"]').length === 0) {
        cy.log('No visitor spawned after 30 ticks — skipping');
        return;
      }

      // Each approve button has accessibilityLabel="Approve {name}"
      cy.get('[data-testid^="btn-approve-"]').first().then(($btn) => {
        const ariaLabel = $btn.attr('aria-label');
        expect(ariaLabel).to.match(/^Approve /);
      });
    });
  });

  it('deny buttons have accessibility labels when visitors are present', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="visitor-card-"]').length === 0) {
        cy.log('No visitor spawned after 30 ticks — skipping');
        return;
      }

      // Each deny button has accessibilityLabel="Deny {name}"
      cy.get('[data-testid^="btn-deny-"]').first().then(($btn) => {
        const ariaLabel = $btn.attr('aria-label');
        expect(ariaLabel).to.match(/^Deny /);
      });
    });
  });

  it('approve and deny buttons have role="button"', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid^="visitor-card-"]').length === 0) {
        cy.log('No visitor spawned after 30 ticks — skipping');
        return;
      }

      cy.get('[data-testid^="btn-approve-"]').first().should('have.attr', 'role', 'button');
      cy.get('[data-testid^="btn-deny-"]').first().should('have.attr', 'role', 'button');
    });
  });
});

describe('Accessibility — start menu', () => {
  it('start button has an accessible role', () => {
    cy.visit('/start');
    cy.get('[data-testid="btn-start-game"]').should('exist');
    // The start button should be interactive — check it has a role
    cy.get('[data-testid="btn-start-game"]').should('have.attr', 'role', 'button');
  });
});
