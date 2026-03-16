import { describe, it, expect } from 'vitest';
import {
  runMigrations,
  migrations,
  CURRENT_STATE_VERSION,
  type Migration,
} from '../migrations';

describe('runMigrations', () => {
  it('returns state unchanged (except version) when already at current version', () => {
    const saved = { version: 3, gold: 100 } as unknown as Record<string, unknown>;
    const result = runMigrations(saved, 3, []);

    expect(result.version).toBe(3);
    expect((result as unknown as Record<string, unknown>).gold).toBe(100);
  });

  it('defaults missing version field to 0 and runs all migrations', () => {
    const migration1: Migration = {
      version: 1,
      migrate: (s) => ({ ...s, migrated1: true }),
    };

    const saved = { gold: 50 } as unknown as Record<string, unknown>;
    const result = runMigrations(saved, 1, [migration1]);

    expect(result.version).toBe(1);
    expect((result as unknown as Record<string, unknown>).migrated1).toBe(true);
  });

  it('runs only migrations with version > savedState.version', () => {
    const migration1: Migration = {
      version: 1,
      migrate: (s) => ({ ...s, v1: true }),
    };
    const migration2: Migration = {
      version: 2,
      migrate: (s) => ({ ...s, v2: true }),
    };
    const migration3: Migration = {
      version: 3,
      migrate: (s) => ({ ...s, v3: true }),
    };

    const saved = { version: 1 } as unknown as Record<string, unknown>;
    const result = runMigrations(saved, 3, [migration1, migration2, migration3]);

    // migration1 should be skipped (version 1 is not > 1)
    expect((result as unknown as Record<string, unknown>).v1).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).v2).toBe(true);
    expect((result as unknown as Record<string, unknown>).v3).toBe(true);
    expect(result.version).toBe(3);
  });

  it('runs migrations in ascending version order regardless of array order', () => {
    const order: number[] = [];

    const migration3: Migration = {
      version: 3,
      migrate: (s) => { order.push(3); return { ...s }; },
    };
    const migration1: Migration = {
      version: 1,
      migrate: (s) => { order.push(1); return { ...s }; },
    };
    const migration2: Migration = {
      version: 2,
      migrate: (s) => { order.push(2); return { ...s }; },
    };

    const saved = { version: 0 } as unknown as Record<string, unknown>;
    runMigrations(saved, 3, [migration3, migration1, migration2]);

    expect(order).toEqual([1, 2, 3]);
  });

  it('chains multiple migrations correctly', () => {
    const migration1: Migration = {
      version: 1,
      migrate: (s) => ({ ...s, count: 1 }),
    };
    const migration2: Migration = {
      version: 2,
      migrate: (s) => ({ ...s, count: (s.count as number) + 10 }),
    };
    const migration3: Migration = {
      version: 3,
      migrate: (s) => ({ ...s, count: (s.count as number) * 2 }),
    };

    const saved = { version: 0 } as unknown as Record<string, unknown>;
    const result = runMigrations(saved, 3, [migration1, migration2, migration3]);

    // v1: count=1, v2: count=11, v3: count=22
    expect((result as unknown as Record<string, unknown>).count).toBe(22);
    expect(result.version).toBe(3);
  });

  it('does not mutate the original saved state', () => {
    const migration1: Migration = {
      version: 1,
      migrate: (s) => ({ ...s, added: true }),
    };

    const saved = { version: 0, original: true } as unknown as Record<string, unknown>;
    const savedCopy = { ...saved };

    runMigrations(saved, 1, [migration1]);

    expect(saved).toEqual(savedCopy);
  });

  it('sets the final version to currentVersion', () => {
    const saved = { version: 0 } as unknown as Record<string, unknown>;
    const result = runMigrations(saved, 5, []);

    expect(result.version).toBe(5);
  });

  it('exports CURRENT_STATE_VERSION as 1', () => {
    expect(CURRENT_STATE_VERSION).toBe(1);
  });

  it('exports an empty migrations registry', () => {
    expect(migrations).toEqual([]);
  });

  it('uses module migrations registry by default when no list provided', () => {
    // With the empty default registry, no migrations run
    const saved = { version: 0 } as unknown as Record<string, unknown>;
    const result = runMigrations(saved, CURRENT_STATE_VERSION);

    expect(result.version).toBe(CURRENT_STATE_VERSION);
  });
});
