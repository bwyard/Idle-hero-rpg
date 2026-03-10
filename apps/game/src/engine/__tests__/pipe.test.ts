import { describe, it, expect } from 'vitest';
import { pipe } from '../pipe';

describe('pipe', () => {
  it('returns the value unchanged when no functions are provided', () => {
    expect(pipe(42)).toBe(42);
  });

  it('applies a single transformation', () => {
    const result = pipe(1, (x) => x + 1);
    expect(result).toBe(2);
  });

  it('chains multiple transformations in order', () => {
    const result = pipe(
      1,
      (x) => x + 1,   // 2
      (x) => x * 3,   // 6
      (x) => x - 2,   // 4
    );
    expect(result).toBe(4);
  });

  it('works with object transformations', () => {
    const result = pipe(
      { count: 0 },
      (s) => ({ ...s, count: s.count + 1 }),
      (s) => ({ ...s, count: s.count + 1 }),
    );
    expect(result).toEqual({ count: 2 });
  });
});
