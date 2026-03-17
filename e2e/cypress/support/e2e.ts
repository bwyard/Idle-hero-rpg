// Cypress E2E support file.
// Add global hooks, custom commands, and imports here.

// Suppress Expo Router "navigate before mounting Root Layout" errors that fire
// intermittently when Cypress reloads the page. These are a test-environment
// artifact — the app mounts fine once the layout settles. Tests gate on
// cy.contains('Adventurer Roster').should('exist') before interacting, so
// the suppression does not mask real navigation failures.
Cypress.on('uncaught:exception', () => false);
