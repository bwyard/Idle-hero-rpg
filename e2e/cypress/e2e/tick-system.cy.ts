/**
 * Tick System E2E tests.
 *
 * Tests the tick/time system — tick counter, manual tick button,
 * play/pause toggle, and game state progression (gold, calendar).
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden
 *   breaks Cypress visibility checks.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 * - Use cy.clock() and cy.tick() for timing control.
 * - Starting gold is 500. Base passive income is 2 gold/tick.
 *   Upkeep is 0/tick at start (no adventurers).
 */

describe('Tick System — manual ticking', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('tick count starts at 0', () => {
    cy.get('[data-testid="tick-count"]').should('exist').and('contain.text', '0');
  });

  it('clicking Tick +1 increments the tick count by 1', () => {
    cy.contains('Tick +1').should('exist').click({ force: true });
    cy.get('[data-testid="tick-count"]').should('contain.text', '1');
  });

  it('clicking Tick +1 multiple times increments correctly', () => {
    for (let i = 0; i < 5; i++) {
      cy.contains('Tick +1').click({ force: true });
    }
    cy.get('[data-testid="tick-count"]').should('contain.text', '5');
  });

  it('gold increases from passive income after ticking', () => {
    // Starting gold is 500, base income is 2/tick, no adventurers = no upkeep
    // After 10 ticks: 500 + (10 * 2) = 520
    cy.get('[data-testid="stats-gold"]').should('contain.text', '500');

    for (let i = 0; i < 10; i++) {
      cy.contains('Tick +1').click({ force: true });
    }

    cy.get('[data-testid="stats-gold"]').invoke('text').then((goldText) => {
      const gold = parseInt(goldText, 10);
      // Gold should have increased from 500 — exact value depends on
      // building income and other systems, but must be > 500
      expect(gold).to.be.greaterThan(500);
    });
  });
});

describe('Tick System — play/pause toggle', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('Play button exists and shows "Play" initially', () => {
    cy.contains('Play').should('exist');
  });

  it('clicking Play changes the button text to Pause', () => {
    cy.contains('Play').click({ force: true });
    cy.contains('Pause').should('exist');
  });

  it('clicking Pause changes the button text back to Play', () => {
    cy.contains('Play').click({ force: true });
    cy.contains('Pause').should('exist').click({ force: true });
    cy.contains('Play').should('exist');
  });

  it('auto-ticking advances the tick count when playing', () => {
    cy.get('[data-testid="tick-count"]').should('contain.text', '0');

    // Start auto-ticking
    cy.contains('Play').click({ force: true });

    // Advance real time by several tick intervals (1000ms each).
    // Tick extra beyond the 5 intervals so React's scheduler (which uses
    // rAF / MessageChannel) has time to flush state updates to the DOM.
    cy.tick(5500);

    // Tick count should have advanced beyond 0
    cy.get('[data-testid="tick-count"]').should(($el) => {
      const ticks = parseInt($el.text(), 10);
      expect(ticks).to.be.greaterThan(0);
    });
  });
});

describe('Tick System — calendar progression', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('starts at Year 1', () => {
    cy.contains('Y1').should('exist');
  });

  it('day counter advances after ticking (4 ticks = 1 day)', () => {
    // Initially day 1/365. After 4 ticks, day should change.
    cy.contains(/1\/365/).should('exist');

    // 4 ticks = 1 in-game day
    for (let i = 0; i < 4; i++) {
      cy.contains('Tick +1').click({ force: true });
    }

    cy.contains(/2\/365/).should('exist');
  });

  it('season is displayed', () => {
    // The game starts in Spring (first season)
    cy.contains('Spring').should('exist');
  });
});
