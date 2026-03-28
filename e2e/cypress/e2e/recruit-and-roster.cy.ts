/**
 * Recruit & Roster E2E tests — recruit an adventurer, verify roster,
 * navigate to detail page, and return.
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden
 *   prevents Cypress visibility checks on inner views.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 * - Starting gold is 500, recruit costs 50.
 */

describe('Recruit and Roster flow', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('starts with 500 gold and no adventurers', () => {
    cy.get('[data-testid="stats-gold"]').should('exist').invoke('text').should('eq', '500');
    cy.contains('No adventurers yet').should('exist');
  });

  it('recruits an adventurer and gold decreases by 50', () => {
    cy.get('[data-testid="stats-gold"]').invoke('text').then((goldBefore) => {
      const before = Number(goldBefore);

      cy.contains('Recruit (50g)').click({ force: true });

      cy.get('[data-testid="stats-gold"]')
        .invoke('text')
        .should((goldAfter) => {
          expect(Number(goldAfter)).to.eq(before - 50);
        });
    });
  });

  it('recruited adventurer appears in the roster list', () => {
    cy.contains('Recruit (50g)').click({ force: true });

    // The placeholder "No adventurers yet" should be gone
    cy.contains('No adventurers yet').should('not.exist');

    // Roster section should contain at least one adventurer row with a tier badge
    cy.contains('Adventurer Roster').should('exist');
    // Adventurer rows show the tier letter — F for new recruits
    cy.contains('F').should('exist');
  });

  it('clicking an adventurer navigates to the detail page', () => {
    cy.contains('Recruit (50g)').click({ force: true });

    // Wait for the adventurer to appear in the roster, then click the row.
    // Adventurer rows are Pressable elements with accessibilityLabel starting with "View".
    cy.get('[role="button"][aria-label^="View"]')
      .first()
      .click({ force: true });

    // Should be on the adventurer detail page
    cy.url().should('include', '/adventurer/');

    // Detail page shows the adventurer name (a non-empty text in the header)
    cy.contains('Stats').should('exist');
  });

  it('detail page shows adventurer name, tier F, and XP display', () => {
    cy.contains('Recruit (50g)').click({ force: true });

    // Navigate to the first adventurer's detail
    cy.get('[role="button"][aria-label^="View"]')
      .first()
      .invoke('attr', 'aria-label')
      .then((label) => {
        // label is like "View SomeName, tier F"
        const nameMatch = label?.match(/^View (.+), tier (.+)$/);
        const adventurerName = nameMatch?.[1] ?? '';
        const tier = nameMatch?.[2] ?? '';

        cy.get('[role="button"][aria-label^="View"]')
          .first()
          .click({ force: true });

        // Verify detail page content
        cy.url().should('include', '/adventurer/');

        // Adventurer name displayed
        if (adventurerName) {
          cy.contains(adventurerName).should('exist');
        }

        // Tier badge shows F
        expect(tier).to.eq('F');

        // XP display exists
        cy.get('[data-testid="adventurer-xp"]').should('exist');
        cy.get('[data-testid="adventurer-xp"]').invoke('text').should('include', '/');
      });
  });

  it('can navigate back from detail page to the main screen', () => {
    cy.contains('Recruit (50g)').click({ force: true });

    cy.get('[role="button"][aria-label^="View"]')
      .first()
      .click({ force: true });

    cy.url().should('include', '/adventurer/');

    // Use browser back navigation
    cy.go('back');

    // Should be back on the main screen
    cy.get('[data-testid="stats-gold"]').should('exist');
    cy.contains('Adventurer Roster').should('exist');
  });

  it('can recruit multiple adventurers', () => {
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Recruit (50g)').click({ force: true });

    // Gold should have decreased by 150 (500 - 150 = 350)
    cy.get('[data-testid="stats-gold"]')
      .invoke('text')
      .should((gold) => {
        expect(Number(gold)).to.eq(350);
      });

    // Multiple adventurer rows should exist
    cy.get('[role="button"][aria-label^="View"]')
      .should('have.length', 3);
  });
});
