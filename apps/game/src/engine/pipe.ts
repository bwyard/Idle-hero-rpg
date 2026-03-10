/**
 * pipe — Compose a series of transformations over a value.
 *
 * Used to chain system processors in the tick function.
 * All transformations must be pure functions: (state: T) => T.
 */
export function pipe<T>(value: T, ...fns: ReadonlyArray<(v: T) => T>): T {
  return fns.reduce((acc, fn) => fn(acc), value);
}
