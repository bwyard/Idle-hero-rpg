/**
 * Smoke test — verifies the Expo Web build loads and renders the home screen.
 * Runs against the Expo Web target (not the production Android build).
 */

describe('Home screen', () => {
  it('loads and displays the game title', () => {
    cy.visit('/');
    cy.contains("Retired Hero's Guild").should('be.visible');
  });
});
