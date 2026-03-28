/**
 * Navigation E2E tests — splash screen and start menu.
 *
 * Tests the flow: /splash → /start → / (game)
 *
 * Notes:
 * - Splash auto-navigates after 2200ms; tests use cy.clock() to control time.
 * - All clicks need { force: true } — RN Web overflow:hidden prevents
 *   Cypress visibility checks on inner views.
 * - Use .should('exist') not .should('be.visible') for same reason.
 */

describe('Splash screen', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/splash');
  });

  it('renders the splash screen', () => {
    cy.get('[data-testid="splash-screen"]').should('exist');
  });

  it('shows the game title', () => {
    cy.get('[data-testid="splash-title"]').should('exist');
    cy.contains("Retired Hero's Guild").should('exist');
  });

  it('shows the crest symbol', () => {
    cy.get('[data-testid="splash-crest"]').should('exist');
  });

  it('shows the tagline', () => {
    cy.get('[data-testid="splash-subtitle"]').should('exist');
  });

  it('navigates to start menu after the splash duration', () => {
    cy.tick(2200);
    // Expo Router navigation is async — tick extra time so React and
    // the router can flush pending state updates and rAF callbacks.
    cy.tick(500);
    cy.get('[data-testid="start-menu"]', { timeout: 8000 }).should('exist');
  });
});

describe('Start menu', () => {
  beforeEach(() => {
    cy.visit('/start');
    cy.get('[data-testid="start-menu"]').should('exist');
  });

  it('renders the start menu', () => {
    cy.get('[data-testid="start-menu"]').should('exist');
  });

  it('shows the game title', () => {
    cy.get('[data-testid="start-menu-title"]').should('exist');
    cy.contains("Retired Hero's Guild").should('exist');
  });

  it('has a start or continue button', () => {
    cy.get('[data-testid="btn-start-game"]').should('exist');
  });

  it('navigates to the game when start button is pressed', () => {
    cy.get('[data-testid="btn-start-game"]').click({ force: true });
    // Game loads — stats bar is the gate element
    cy.get('[data-testid="stats-gold"]').should('exist');
  });
});
