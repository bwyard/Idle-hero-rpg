import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { processTransientVisitors } from '../processTransientVisitors';
import { createInitialGameState } from '../../stores/initialState';
import {
  PLACEHOLDER_MAX_VISITORS,
  PLACEHOLDER_VISITOR_STAY_DAYS,
  TICKS_PER_DAY,
} from '../../data/balance';
import type { GameState, TransientVisitor } from '@idle-hero-rpg/shared';

/** Helper to create a visitor with sensible defaults. */
function makeVisitor(overrides: Partial<TransientVisitor> = {}): TransientVisitor {
  return {
    id: 'vis_test1',
    name: 'TestVisitor',
    tier: 'F',
    archetype: null,
    serviceRequest: 'Quest',
    serviceFee: 5,
    arrivedAtTick: 0,
    expiresAtTick: 50,
    heldUntilTick: null,
    holdCount: 0,
    ...overrides,
  };
}

/** Buildings that enable all visitor services, for testing. */
const SERVICE_ENABLED_BUILDINGS: GameState['buildings'] = {
  bld_guildhall: {
    id: 'bld_guildhall',
    templateId: 'guild-hall',
    level: 1,
    cityId: 'cty_heartlands',
    upgradeTicksRemaining: 0,
  },
  bld_training: {
    id: 'bld_training',
    templateId: 'training-grounds',
    level: 1,
    cityId: 'cty_heartlands',
    upgradeTicksRemaining: 0,
  },
  bld_tavern: {
    id: 'bld_tavern',
    templateId: 'tavern',
    level: 2,
    cityId: 'cty_heartlands',
    upgradeTicksRemaining: 0,
  },
  bld_smithy: {
    id: 'bld_smithy',
    templateId: 'smithy',
    level: 1,
    cityId: 'cty_heartlands',
    upgradeTicksRemaining: 0,
  },
  bld_infirmary: {
    id: 'bld_infirmary',
    templateId: 'infirmary',
    level: 1,
    cityId: 'cty_heartlands',
    upgradeTicksRemaining: 0,
  },
  bld_questboard: {
    id: 'bld_questboard',
    templateId: 'quest-board',
    level: 1,
    cityId: 'cty_heartlands',
    upgradeTicksRemaining: 0,
  },
};

/** Helper to create a state with specific visitors and tick count. Includes service-enabling buildings. */
function stateWithVisitors(
  visitors: Record<string, TransientVisitor>,
  ticksElapsed = 100,
  buildings: GameState['buildings'] = SERVICE_ENABLED_BUILDINGS,
): GameState {
  return {
    ...createInitialGameState(),
    time: { ticksElapsed, currentDay: 0, currentSeason: 'Spring' as const, currentYear: 0 },
    transientVisitors: visitors,
    buildings,
  };
}

describe('processTransientVisitors', () => {
  describe('expiration', () => {
    it('removes expired visitors when ticksElapsed >= expiresAtTick and not held', () => {
      const visitor = makeVisitor({ id: 'vis_1', expiresAtTick: 50, heldUntilTick: null });
      const state = stateWithVisitors({ vis_1: visitor }, 50);

      const next = processTransientVisitors(state, () => 0); // no spawns
      expect(next.transientVisitors['vis_1']).toBeUndefined();
    });

    it('removes expired visitors when heldUntilTick has also elapsed', () => {
      const visitor = makeVisitor({
        id: 'vis_1',
        expiresAtTick: 50,
        heldUntilTick: 60,
      });
      const state = stateWithVisitors({ vis_1: visitor }, 60);

      const next = processTransientVisitors(state, () => 0);
      expect(next.transientVisitors['vis_1']).toBeUndefined();
    });

    it('does NOT remove a visitor whose heldUntilTick has not elapsed', () => {
      const visitor = makeVisitor({
        id: 'vis_1',
        expiresAtTick: 50,
        heldUntilTick: 120,
      });
      const state = stateWithVisitors({ vis_1: visitor }, 60);

      const next = processTransientVisitors(state, () => 0);
      expect(next.transientVisitors['vis_1']).toBeDefined();
    });

    it('does NOT remove a visitor whose expiresAtTick has not elapsed', () => {
      const visitor = makeVisitor({
        id: 'vis_1',
        expiresAtTick: 200,
        heldUntilTick: null,
      });
      const state = stateWithVisitors({ vis_1: visitor }, 100);

      const next = processTransientVisitors(state, () => 0);
      expect(next.transientVisitors['vis_1']).toBeDefined();
    });

    it('emits departure event for each expired visitor', () => {
      const visitor = makeVisitor({ id: 'vis_1', expiresAtTick: 50, heldUntilTick: null });
      const state = stateWithVisitors({ vis_1: visitor }, 50);

      const next = processTransientVisitors(state, () => 0);
      const departures = next.pendingEvents.filter((e) => e.type === 'VISITOR_DEPARTURE');
      expect(departures).toHaveLength(1);
      expect(departures[0]?.message).toContain('TestVisitor');
    });
  });

  describe('spawning', () => {
    it('spawns a new visitor when random < spawn chance and under max', () => {
      const state = stateWithVisitors({}, 10);

      // random returns 0 = always below PLACEHOLDER_VISITOR_SPAWN_CHANCE (0.05)
      const next = processTransientVisitors(state, () => 0);
      const visitors = Object.values(next.transientVisitors);
      expect(visitors).toHaveLength(1);
    });

    it('spawned visitor has a positive serviceFee', () => {
      const state = stateWithVisitors({}, 10);
      const next = processTransientVisitors(state, () => 0);
      const visitor = Object.values(next.transientVisitors)[0];
      expect(visitor).toBeDefined();
      expect(visitor!.serviceFee).toBeGreaterThan(0);
    });

    it('does NOT spawn when random >= spawn chance', () => {
      const state = stateWithVisitors({}, 10);

      // random returns 1 = always above any spawn chance
      const next = processTransientVisitors(state, () => 1);
      const visitors = Object.values(next.transientVisitors);
      expect(visitors).toHaveLength(0);
    });

    it('does NOT exceed max visitors', () => {
      // Fill to max
      const visitors: Record<string, TransientVisitor> = {};
      for (let i = 0; i < PLACEHOLDER_MAX_VISITORS; i++) {
        const id = `vis_${i}`;
        visitors[id] = makeVisitor({
          id,
          name: `Visitor${i}`,
          expiresAtTick: 999,
        });
      }
      const state = stateWithVisitors(visitors, 10);

      const next = processTransientVisitors(state, () => 0);
      expect(Object.keys(next.transientVisitors)).toHaveLength(PLACEHOLDER_MAX_VISITORS);
    });

    it('new visitors have valid fields', () => {
      const state = stateWithVisitors({}, 42);
      const next = processTransientVisitors(state, () => 0);
      const visitors = Object.values(next.transientVisitors);
      expect(visitors).toHaveLength(1);

      const v = visitors[0]!;
      expect(v.id).toMatch(/^vis_/);
      expect(v.name).toBeTruthy();
      expect(v.tier).toBeTruthy();
      expect(v.serviceRequest).toBeTruthy();
      expect(v.arrivedAtTick).toBe(42);
      expect(v.expiresAtTick).toBe(42 + PLACEHOLDER_VISITOR_STAY_DAYS * TICKS_PER_DAY);
      expect(v.heldUntilTick).toBeNull();
      expect(v.holdCount).toBe(0);
    });

    it('emits arrival event for each spawned visitor', () => {
      const state = stateWithVisitors({}, 10);

      const next = processTransientVisitors(state, () => 0);
      const arrivals = next.pendingEvents.filter((e) => e.type === 'VISITOR_ARRIVAL');
      expect(arrivals).toHaveLength(1);
    });
  });

  describe('purity', () => {
    it('does not mutate the input state', () => {
      const visitor = makeVisitor({ id: 'vis_1', expiresAtTick: 50 });
      const state = stateWithVisitors({ vis_1: visitor }, 50);
      const original = JSON.parse(JSON.stringify(state)) as GameState;

      processTransientVisitors(state, () => 0);
      expect(state).toEqual(original);
    });

    it('property: spawning never increases visitor count above max', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: PLACEHOLDER_MAX_VISITORS }),
          fc.float({ min: 0, max: 1 }),
          (existingCount, randomVal) => {
            const visitors: Record<string, TransientVisitor> = {};
            for (let i = 0; i < existingCount; i++) {
              const id = `vis_${i}`;
              visitors[id] = makeVisitor({ id, expiresAtTick: 9999 });
            }
            const state = stateWithVisitors(visitors, 10);
            const next = processTransientVisitors(state, () => randomVal);
            return Object.keys(next.transientVisitors).length <= PLACEHOLDER_MAX_VISITORS;
          },
        ),
      );
    });
  });

  describe('service gating', () => {
    it('does not spawn visitors when no buildings enable any service', () => {
      // guild-hall has enablesService: null
      const noServiceBuildings: GameState['buildings'] = {
        bld_guildhall: {
          id: 'bld_guildhall',
          templateId: 'guild-hall',
          level: 5,
          cityId: 'cty_heartlands',
          upgradeTicksRemaining: 0,
        },
      };
      const state = stateWithVisitors({}, 10, noServiceBuildings);
      const next = processTransientVisitors(state, () => 0);
      expect(Object.keys(next.transientVisitors)).toHaveLength(0);
    });

    it('spawns visitors when at least one service-enabling building exists', () => {
      const oneServiceBuilding: GameState['buildings'] = {
        bld_smithy: {
          id: 'bld_smithy',
          templateId: 'smithy',
          level: 1,
          cityId: 'cty_heartlands',
          upgradeTicksRemaining: 0,
        },
      };
      const state = stateWithVisitors({}, 10, oneServiceBuilding);
      const next = processTransientVisitors(state, () => 0);
      expect(Object.keys(next.transientVisitors)).toHaveLength(1);
      // Visitor should be requesting Repair (only fulfillable service)
      const visitor = Object.values(next.transientVisitors)[0]!;
      expect(visitor.serviceRequest).toBe('Repair');
    });

    it('does not spawn visitors when building level is too low for service', () => {
      // tavern enables Lodging at level 2+, but this one is only level 1
      const lowLevelBuilding: GameState['buildings'] = {
        bld_tavern: {
          id: 'bld_tavern',
          templateId: 'tavern',
          level: 1,
          cityId: 'cty_heartlands',
          upgradeTicksRemaining: 0,
        },
      };
      const state = stateWithVisitors({}, 10, lowLevelBuilding);
      const next = processTransientVisitors(state, () => 0);
      expect(Object.keys(next.transientVisitors)).toHaveLength(0);
    });
  });
});
