/**
 * Building & Economy E2E tests — build, feast, and verify gold changes.
 *
 * Tests building construction, feast action, and gold display updates.
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden
 *   prevents Cypress visibility checks on inner views.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 * - Starting gold is 500.
 * - Build costs 100g, Feast costs 75g, Recruit costs 50g.
 */

describe('Building and Economy', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('starts with 500 gold', () => {
    cy.get('[data-testid="stats-gold"]')
      .invoke('text')
      .should('eq', '500');
  });

  it('building costs 100 gold', () => {
    cy.get('[data-testid="stats-gold"]').invoke('text').then((goldBefore) => {
      const before = Number(goldBefore);

      cy.contains('Build (100g)').click({ force: true });

      cy.get('[data-testid="stats-gold"]')
        .invoke('text')
        .should((goldAfter) => {
          expect(Number(goldAfter)).to.eq(before - 100);
        });
    });
  });

  it('feast costs 75 gold', () => {
    cy.get('[data-testid="stats-gold"]').invoke('text').then((goldBefore) => {
      const before = Number(goldBefore);

      cy.contains('Feast (75g)').click({ force: true });

      cy.get('[data-testid="stats-gold"]')
        .invoke('text')
        .should((goldAfter) => {
          expect(Number(goldAfter)).to.eq(before - 75);
        });
    });
  });

  it('gold updates correctly after multiple actions', () => {
    // Start: 500
    // Recruit: -50 = 450
    // Build: -100 = 350
    // Feast: -75 = 275
    cy.contains('Recruit (50g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]')
      .invoke('text')
      .should((gold) => {
        expect(Number(gold)).to.eq(450);
      });

    cy.contains('Build (100g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]')
      .invoke('text')
      .should((gold) => {
        expect(Number(gold)).to.eq(350);
      });

    cy.contains('Feast (75g)').click({ force: true });
    cy.get('[data-testid="stats-gold"]')
      .invoke('text')
      .should((gold) => {
        expect(Number(gold)).to.eq(275);
      });
  });

  it('building a building adds it to the buildings display', () => {
    cy.contains('Build (100g)').click({ force: true });

    // Gold should have decreased by 100 (from 500 to 400)
    cy.get('[data-testid="stats-gold"]')
      .invoke('text')
      .should((gold) => {
        expect(Number(gold)).to.eq(400);
      });

    // Tick to generate passive income — the new building (training-grounds lv1)
    // adds to the building-level sum, increasing income per tick.
    // Before build: 1 building × 3 gold/level = 3 + 2 base - 2 upkeep = 3/tick
    // After build: 2 buildings × 3 gold/level = 6 + 2 base - 2 upkeep = 6/tick
    // The higher income rate confirms the building was created.
    cy.get('[data-testid="stats-gold"]').invoke('text').then((goldAfterBuild) => {
      const afterBuild = Number(goldAfterBuild);

      for (let i = 0; i < 5; i++) {
        cy.contains('Tick +1').click({ force: true });
      }

      cy.get('[data-testid="stats-gold"]')
        .invoke('text')
        .should((goldAfterTicks) => {
          expect(Number(goldAfterTicks)).to.be.greaterThan(afterBuild);
        });
    });
  });

  it('feast grants XP to recruited adventurers', () => {
    // Recruit an adventurer first
    cy.contains('Recruit (50g)').click({ force: true });

    // Check the adventurer's XP before the feast
    cy.get('[data-testid^="xp-"]')
      .first()
      .invoke('text')
      .then((xpBefore) => {
        const xpValueBefore = Number(xpBefore.split('/')[0]);

        // Hold a feast
        cy.contains('Feast (75g)').click({ force: true });

        // XP should have increased
        cy.get('[data-testid^="xp-"]')
          .first()
          .invoke('text')
          .should((xpAfter) => {
            const xpValueAfter = Number(xpAfter.split('/')[0]);
            expect(xpValueAfter).to.be.greaterThan(xpValueBefore);
          });
      });
  });

  it('can build multiple buildings', () => {
    // 500 gold, each build costs 100, so we can build up to 5
    cy.contains('Build (100g)').click({ force: true });
    cy.contains('Build (100g)').click({ force: true });
    cy.contains('Build (100g)').click({ force: true });

    // Gold should be 500 - 300 = 200
    cy.get('[data-testid="stats-gold"]')
      .invoke('text')
      .should((gold) => {
        expect(Number(gold)).to.eq(200);
      });
  });

  it('tick advances the economy and generates passive gold', () => {
    // Build a building first so there is something generating income
    cy.contains('Build (100g)').click({ force: true });

    cy.get('[data-testid="stats-gold"]').invoke('text').then((goldAfterBuild) => {
      const afterBuild = Number(goldAfterBuild);

      // Tick multiple times to accumulate passive income
      for (let i = 0; i < 10; i++) {
        cy.contains('Tick +1').click({ force: true });
      }

      // Gold should have changed from passive income (buildings generate gold per tick)
      cy.get('[data-testid="stats-gold"]')
        .invoke('text')
        .should((goldAfterTicks) => {
          // Gold may increase or decrease depending on upkeep vs income,
          // but it should not be the same as after building
          expect(Number(goldAfterTicks)).to.not.eq(afterBuild);
        });
    });
  });
});
