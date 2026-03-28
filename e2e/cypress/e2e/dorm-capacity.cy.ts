/**
 * Dorm Capacity E2E tests.
 *
 * Tests dorm capacity limits and the overcapacity recruit surcharge.
 *
 * Balance constants:
 *   PLACEHOLDER_STARTING_GOLD = 500
 *   PLACEHOLDER_RECRUIT_COST = 50
 *   BASE_DORM_CAPACITY = 4
 *   OVERCAPACITY_RECRUIT_SURCHARGE = 1.5
 *
 * Initial state: 2 starter adventurers (Kira, Tomas) already in dorm.
 * First 2 recruits cost 50g each (fills dorm to 4/4).
 * 3rd recruit onwards costs 75g (overcapacity surcharge: 50 * 1.5).
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 */

describe('Dorm Capacity — recruiting within capacity', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('starts with 500 gold', () => {
    cy.get('[data-testid="stats-gold"]').should('contain.text', '500');
  });

  it('first recruit costs 50 gold (2 starters + 1 = 3/4 capacity)', () => {
    cy.contains('Recruit (50g)').should('exist').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('contain.text', '450');
  });

  it('second recruit costs 50 gold (4/4 capacity reached)', () => {
    for (let i = 0; i < 2; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    // 500 - (2 * 50) = 400
    cy.get('[data-testid="stats-gold"]').should('contain.text', '400');
  });
});

describe('Dorm Capacity — overcapacity surcharge', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('3rd recruit costs 75 gold (overcapacity surcharge: 50 * 1.5)', () => {
    // Fill dorm to capacity: 2 recruits at 50g = 500 - 100 = 400
    for (let i = 0; i < 2; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    cy.get('[data-testid="stats-gold"]').should('contain.text', '400');

    // 3rd recruit with overcapacity surcharge: 400 - 75 = 325
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('contain.text', '325');
  });

  it('can continue recruiting with surcharge until gold runs out', () => {
    // Fill dorm: 2 at 50g = 400 remaining
    for (let i = 0; i < 2; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }

    // Overcapacity recruits at 75g each:
    // 3rd: 400 - 75 = 325
    // 4th: 325 - 75 = 250
    // 5th: 250 - 75 = 175
    // 6th: 175 - 75 = 100
    // 7th: 100 - 75 = 25
    for (let i = 0; i < 5; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    cy.get('[data-testid="stats-gold"]').should('contain.text', '25');
  });

  it('recruiting fails when gold is insufficient', () => {
    // Fill dorm: 2 at 50g = 400
    for (let i = 0; i < 2; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }

    // 5 overcapacity at 75g = 400 - 375 = 25
    for (let i = 0; i < 5; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    cy.get('[data-testid="stats-gold"]').should('contain.text', '25');

    // Cannot afford 75g surcharge — gold should stay at 25
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]').invoke('text').then((goldText) => {
      const gold = parseInt(goldText, 10);
      expect(gold).to.eq(25);
    });
  });
});
