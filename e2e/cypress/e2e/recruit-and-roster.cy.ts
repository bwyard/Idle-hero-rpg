/**
 * Recruit & Roster E2E tests — recruit an adventurer, verify roster,
 * navigate to detail page, and return.
 *
 * Initial state: 2 starter adventurers (Kira, Tomas) in dorm.
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 * - Starting gold is 500, recruit costs 50.
 */

describe('Recruit and Roster flow', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('starts with 500 gold and 2 starter adventurers', () => {
    cy.get('[data-testid="stats-gold"]').should('exist').invoke('text').should('eq', '500');
    cy.contains('Adventurer Roster').should('exist');
    // 2 starter adventurers have xp testIDs
    cy.get('[data-testid^="xp-"]').should('have.length', 2);
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

    // Should now have 3 adventurers (2 starters + 1 recruit)
    cy.get('[data-testid^="xp-"]').should('have.length', 3);
  });

  it('clicking an adventurer navigates to the detail page', () => {
    // Adventurer rows are Pressable elements with role="button"
    cy.get('[role="button"][aria-label^="View"]')
      .first()
      .click({ force: true });

    cy.url().should('include', '/adventurer/');
    cy.contains('Stats').should('exist');
  });

  it('detail page shows adventurer name, tier F, and XP display', () => {
    cy.get('[role="button"][aria-label^="View"]')
      .first()
      .invoke('attr', 'aria-label')
      .then((label) => {
        const nameMatch = label?.match(/^View (.+), tier (.+)$/);
        const adventurerName = nameMatch?.[1] ?? '';
        const tier = nameMatch?.[2] ?? '';

        cy.get('[role="button"][aria-label^="View"]')
          .first()
          .click({ force: true });

        cy.url().should('include', '/adventurer/');

        if (adventurerName) {
          cy.contains(adventurerName).should('exist');
        }

        expect(tier).to.eq('F');

        cy.get('[data-testid="adventurer-xp"]').should('exist');
        cy.get('[data-testid="adventurer-xp"]').invoke('text').should('include', '/');
      });
  });

  it('can navigate back from detail page to the main screen', () => {
    cy.get('[role="button"][aria-label^="View"]')
      .first()
      .click({ force: true });

    cy.url().should('include', '/adventurer/');

    cy.go('back');

    cy.get('[data-testid="stats-gold"]').should('exist');
    cy.contains('Adventurer Roster').should('exist');
  });

  it('can recruit multiple adventurers', () => {
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Recruit (50g)').click({ force: true });

    // Dorm capacity = 4 (BASE_DORM_CAPACITY). 2 starters already occupy dorm.
    // Recruit 1: 2 in dorm → not at capacity → cost 50. Gold: 500 - 50 = 450
    // Recruit 2: 3 in dorm → not at capacity → cost 50. Gold: 450 - 50 = 400
    // Recruit 3: 4 in dorm → at capacity → cost ceil(50 × 1.5) = 75. Gold: 400 - 75 = 325
    cy.get('[data-testid="stats-gold"]')
      .invoke('text')
      .should((gold) => {
        expect(Number(gold)).to.eq(325);
      });

    // 2 starters + 3 recruits = 5 adventurers
    cy.get('[role="button"][aria-label^="View"]')
      .should('have.length', 5);
  });
});
