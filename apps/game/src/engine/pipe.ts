/**
 * pipe — Compose a series of transformations over a value.
 *
 * Used to chain system processors in the tick function.
 * All transformations must be pure functions: (state: T) => T.
 */
export const pipe = <T>(value: T, ...fns: readonly ((v: T) => T)[]): T => {
  return fns.reduce((acc, fn) => fn(acc), value);
};
