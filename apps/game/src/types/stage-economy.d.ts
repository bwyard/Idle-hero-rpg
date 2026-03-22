/**
 * Type shim for @stage/stage-economy.
 *
 * stage-economy's loot.ts line 33 uses array indexing that conflicts with
 * idle-hero's noUncheckedIndexedAccess:true — returns `T | undefined` but
 * the function is typed to return `T | null`. Signal sent to stage to fix
 * at source (same fix prime applied on PR #20). Remove this shim and the
 * tsconfig path alias once stage resolves it.
 *
 * Only functions idle-hero actually imports are declared here.
 */

// ─── Currency utilities (core.ts) ────────────────────────────────────────────

/** Returns true if gold >= cost. */
export declare const canAffordGold: (gold: number, cost: number) => boolean;

/** Returns gold - cost (clamped to 0). */
export declare const spendGold: (gold: number, cost: number) => number;

/** Returns gold + amount. */
export declare const addGold: (gold: number, amount: number) => number;

// ─── Building upgrade formulas (curves.ts) ───────────────────────────────────

/** Gold cost for upgrading to targetLevel: base × targetLevel². */
export declare const calcUpgradeCost: (base: number, targetLevel: number) => number;

/** Tick duration for upgrading to targetLevel: baseTicks × targetLevel. */
export declare const calcUpgradeDuration: (baseTicks: number, targetLevel: number) => number;
