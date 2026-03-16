import { describe, it, expect } from 'vitest';
import { splitByDisclosure } from '../progressiveDisclosure';
import type { Adventurer } from '@idle-hero-rpg/shared';

function makeAdv(id: string, tier: Adventurer['tier']): Adventurer {
  return {
    id,
    name: `Adv_${id}`,
    tier,
    archetype: 'Fighter',
    xp: 0,
    milestones: [],
    skillBorrowUsed: false,
    recruitedYear: 0,
    retiredYear: null,
  };
}

describe('splitByDisclosure', () => {
  it('returns empty results for empty input', () => {
    const result = splitByDisclosure([]);
    expect(result.detailed).toEqual([]);
    expect(result.aggregated).toEqual([]);
    expect(result.collapsedCount).toBe(0);
  });

  it('puts F, E, D tier adventurers in aggregated', () => {
    const advs = [makeAdv('1', 'F'), makeAdv('2', 'E'), makeAdv('3', 'D')];
    const result = splitByDisclosure(advs);
    expect(result.detailed).toHaveLength(0);
    expect(result.aggregated).toHaveLength(3);
    expect(result.collapsedCount).toBe(3);
  });

  it('puts C and above in detailed', () => {
    const advs = [makeAdv('1', 'C'), makeAdv('2', 'A'), makeAdv('3', 'SS')];
    const result = splitByDisclosure(advs);
    expect(result.detailed).toHaveLength(3);
    expect(result.aggregated).toHaveLength(0);
    expect(result.collapsedCount).toBe(0);
  });

  it('splits mixed roster correctly', () => {
    const advs = [
      makeAdv('1', 'F'),
      makeAdv('2', 'F'),
      makeAdv('3', 'D'),
      makeAdv('4', 'B'),
      makeAdv('5', 'S'),
    ];
    const result = splitByDisclosure(advs);
    expect(result.detailed).toHaveLength(2); // B and S
    expect(result.aggregated).toHaveLength(2); // F (count 2), D (count 1)
    expect(result.collapsedCount).toBe(3);
  });

  it('counts multiple adventurers of same collapsed tier', () => {
    const advs = [makeAdv('1', 'F'), makeAdv('2', 'F'), makeAdv('3', 'F')];
    const result = splitByDisclosure(advs);
    expect(result.aggregated).toHaveLength(1);
    expect(result.aggregated[0]?.tier).toBe('F');
    expect(result.aggregated[0]?.count).toBe(3);
  });

  it('sorts aggregated tiers in order: F, E, D', () => {
    const advs = [makeAdv('1', 'D'), makeAdv('2', 'F'), makeAdv('3', 'E')];
    const result = splitByDisclosure(advs);
    expect(result.aggregated.map((a) => a.tier)).toEqual(['F', 'E', 'D']);
  });

  it('Legendary goes to detailed', () => {
    const advs = [makeAdv('1', 'Legendary')];
    const result = splitByDisclosure(advs);
    expect(result.detailed).toHaveLength(1);
    expect(result.aggregated).toHaveLength(0);
  });
});
