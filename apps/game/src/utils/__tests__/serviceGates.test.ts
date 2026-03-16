import { describe, it, expect } from 'vitest';
import { canFulfillService } from '../serviceGates';
import type { Building } from '@idle-hero-rpg/shared';

/** Helper to create a building with specific template and level. */
function makeBuilding(templateId: string, level: number): Building {
  return {
    id: `bld_test_${templateId}`,
    templateId,
    level,
    cityId: 'cty_heartlands',
    upgradeTicksRemaining: 0,
  };
}

describe('canFulfillService', () => {
  it('returns true when a building enables the service at required level', () => {
    const buildings = { bld_1: makeBuilding('training-grounds', 1) };
    expect(canFulfillService('Training', buildings)).toBe(true);
  });

  it('returns false when no building enables the service', () => {
    const buildings = { bld_1: makeBuilding('guild-hall', 5) };
    expect(canFulfillService('Training', buildings)).toBe(false);
  });

  it('returns false when building exists but level is too low', () => {
    // Tavern enables Lodging at level 2+
    const buildings = { bld_1: makeBuilding('tavern', 1) };
    expect(canFulfillService('Lodging', buildings)).toBe(false);
  });

  it('returns true when building meets exact minimum level', () => {
    const buildings = { bld_1: makeBuilding('tavern', 2) };
    expect(canFulfillService('Lodging', buildings)).toBe(true);
  });

  it('returns true when building exceeds minimum level', () => {
    const buildings = { bld_1: makeBuilding('tavern', 5) };
    expect(canFulfillService('Lodging', buildings)).toBe(true);
  });

  it('returns false for empty buildings record', () => {
    expect(canFulfillService('Quest', {})).toBe(false);
  });

  it('checks multiple buildings and returns true if any qualifies', () => {
    const buildings = {
      bld_1: makeBuilding('guild-hall', 3),
      bld_2: makeBuilding('smithy', 1),
    };
    expect(canFulfillService('Repair', buildings)).toBe(true);
  });
});
