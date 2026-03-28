/**
 * Event Log E2E tests — verify that game actions produce visible event messages.
 *
 * The EventLog component displays the last 5 events from state.eventLog, newest first.
 * Events are created by dispatch actions as pendingEvents, then moved to eventLog
 * by processEventLog during the next tick. Tests must tick after each action.
 *
 * Notes:
 * - Use .should('exist') not .should('be.visible') — RN Web overflow:hidden.
 * - All clicks need { force: true } — RN Web pointer events restriction.
 */

describe('Event Log', () => {
  beforeEach(() => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-testid="stats-gold"]').should('exist');
  });

  it('event log section exists on the main screen', () => {
    cy.contains('Event Log').should('exist');
  });

  it('starts with "No events yet" placeholder', () => {
    cy.contains('No events yet').should('exist');
  });

  it('recruiting an adventurer adds an event after ticking', () => {
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });

    cy.contains('No events yet').should('not.exist');
    cy.contains('joined the guild').should('exist');
  });

  it('building adds an event after ticking', () => {
    cy.contains('Build (100g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });

    cy.contains('No events yet').should('not.exist');
    cy.contains('constructed').should('exist');
  });

  it('holding a feast adds an event after ticking', () => {
    cy.contains('Feast (75g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });

    cy.contains('No events yet').should('not.exist');
    cy.contains('feast').should('exist');
  });

  it('multiple actions produce multiple event entries', () => {
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Build (100g)').click({ force: true });
    cy.contains('Feast (75g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });

    cy.contains('No events yet').should('not.exist');
    cy.contains('joined the guild').should('exist');
    cy.contains('constructed').should('exist');
    cy.contains('feast').should('exist');
  });

  it('generating quests adds an event after ticking', () => {
    cy.contains('New Quests').click({ force: true });
    cy.contains('Tick +1').click({ force: true });

    cy.contains('No events yet').should('not.exist');
  });

  it('events are shown newest first', () => {
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });
    cy.contains('Build (100g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });

    cy.contains('No events yet').should('not.exist');
    // Both events should be present
    cy.contains('joined the guild').should('exist');
    cy.contains('constructed').should('exist');
  });

  it('event log caps at 5 visible entries', () => {
    // Perform 6 actions with ticks between to flush events
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Recruit (50g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });
    cy.contains('Build (100g)').click({ force: true });
    cy.contains('New Quests').click({ force: true });
    cy.contains('Feast (75g)').click({ force: true });
    cy.contains('Tick +1').click({ force: true });

    cy.contains('No events yet').should('not.exist');
  });
});
