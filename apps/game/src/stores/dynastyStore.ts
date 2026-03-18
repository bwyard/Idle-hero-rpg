/**
 * dynastyStore — Deferred dynasty meta-progression slice (Zustand).
 *
 * Implements the "dynasty layer" of three-layer state loading per ADR-003:
 *   1. Active run — loads immediately on launch (gameStore)
 *   2. Dynasty layer — loads after first render (this store, deferred)
 *   3. History layer — loads on demand only
 *
 * The store holds DynastyState | null. null means dynasty data has not yet
 * been loaded. Cross-run feature gates treat null as "all features locked".
 *
 * TODO: Persist via MMKV once the dynasty persistence key and serialization
 * format are decided (follow-up to ADR-003).
 */

import { create } from 'zustand';
import type { DynastyState } from '@idle-hero-rpg/shared';

export interface DynastyStore {
  dynasty: DynastyState | null;
  loadDynasty: (data: DynastyState) => void;
  resetDynasty: () => void;
}

export const useDynastyStore = create<DynastyStore>((set) => ({
  dynasty: null,
  loadDynasty: (data) => set({ dynasty: data }),
  resetDynasty: () => set({ dynasty: null }),
}));
