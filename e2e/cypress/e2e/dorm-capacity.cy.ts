/**
 * Dorm Capacity E2E tests.
 *
 * Tests dorm capacity limits and the overcapacity recruit surcharge.
 *
 * Balance constants (from balance.ts / economy.ts):
 *   PLACEHOLDER_STARTING_GOLD = 500
 *   PLACEHOLDER_RECRUIT_COST = 50
 *   BASE_DORM_CAPACITY = 4
 *   OVERCAPACITY_RECRUIT_SURCHARGE = 1.5 (multiplier on recruit cost)
 *
 * First 4 recruits cost 50g each (within dorm capacity).
 * 5th recruit costs 50 * 1.5 = 75g (overcapacity surcharge).
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden
 *   breaks Cypress visibility checks.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 * - Use cy.clock() and cy.tick() for timing control.
 */

describe('Dorm Capacity — recruiting within capacity', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.tick(2500);
    cy.get('[data-testid="btn-start-game"]').should('exist').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('starts with 500 gold', () => {
    cy.get('[data-testid="stats-gold"]').should('contain.text', '500');
  });

  it('recruiting first adventurer costs 50 gold (450 remaining)', () => {
    cy.contains('Recruit (50g)').should('exist').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('contain.text', '450');
  });

  it('recruiting 4 adventurers costs 200 gold total (300 remaining)', () => {
    for (let i = 0; i < 4; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    cy.get('[data-testid="stats-gold"]').should('contain.text', '300');
  });
});

describe('Dorm Capacity — overcapacity surcharge', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.tick(2500);
    cy.get('[data-testid="btn-start-game"]').should('exist').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('5th recruit costs 75 gold (overcapacity surcharge: 50 * 1.5)', () => {
    // Recruit 4 within capacity: 500 - (4 * 50) = 300
    for (let i = 0; i < 4; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    cy.get('[data-testid="stats-gold"]').should('contain.text', '300');

    // 5th recruit with overcapacity surcharge: 300 - 75 = 225
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('contain.text', '225');
  });

  it('can continue recruiting with surcharge until gold runs out', () => {
    // Recruit 4 within capacity: 500 - 200 = 300
    for (let i = 0; i < 4; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }
    cy.get('[data-testid="stats-gold"]').should('contain.text', '300');

    // 5th recruit: 300 - 75 = 225
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('contain.text', '225');

    // 6th recruit: 225 - 75 = 150
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('contain.text', '150');

    // 7th recruit: 150 - 75 = 75
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('contain.text', '75');

    // 8th recruit: 75 - 75 = 0
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]').should('contain.text', '0');
  });

  it('recruiting fails when gold is insufficient', () => {
    // Recruit 4 within capacity: 500 - 200 = 300
    for (let i = 0; i < 4; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }

    // Recruit 4 more with surcharge: 300 - (4 * 75) = 0
    for (let i = 0; i < 4; i++) {
      cy.contains('Recruit (50g)').click({ force: true });
    }

    cy.get('[data-testid="stats-gold"]').should('contain.text', '0');

    // Attempt one more recruit — gold should stay at 0 (cannot afford)
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]').invoke('text').then((goldText) => {
      const gold = parseInt(goldText, 10);
      // Gold should not go negative — recruit should have been rejected
      expect(gold).to.be.at.least(0);
    });
  });
});
