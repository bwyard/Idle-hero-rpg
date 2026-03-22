/**
 * Type shim for @prime/prime-random.
 *
 * TypeScript path alias points here during tsc (noUncheckedIndexedAccess would
 * cause errors on prime-random's Bridson/prngShuffled internals if we pointed
 * directly at source). Vitest's resolve.alias still points at source for runtime.
 *
 * Signal sent to prime to fix the source-level TS strict compatibility. Update
 * this shim and the tsconfig path when prime resolves it.
 */

/** Mulberry32 pure step — LOAD + COMPUTE only. */
export declare const prngNext: (seed: number) => readonly [number, number];

/** Pure float in [min, max). */
export declare const prngRange: (
  seed: number,
  min: number,
  max: number,
) => readonly [number, number];

/** Pure integer in [0, n). */
export declare const prngRangeInt: (seed: number, n: number) => readonly [number, number];

/** Pure boolean with probability p of true. */
export declare const prngBool: (seed: number, p: number) => readonly [boolean, number];

/** Pure Fisher-Yates shuffle — returns new array, original unchanged. */
export declare const prngShuffled: <T>(seed: number, arr: readonly T[]) => readonly [T[], number];

/** Pure random element from array. */
export declare const prngChoose: <T>(
  seed: number,
  arr: readonly T[],
) => readonly [T | undefined, number];

/** Weighted random choice — O(n) linear scan. */
export declare const weightedChoice: (
  seed: number,
  weights: readonly number[],
) => readonly [number, number];

/** Poisson disk sampling — minimum distance spacing in 2D. */
export declare const poissonDisk2d: (
  seed: number,
  width: number,
  height: number,
  minDist: number,
  maxAttempts?: number,
) => readonly [number, number][];
