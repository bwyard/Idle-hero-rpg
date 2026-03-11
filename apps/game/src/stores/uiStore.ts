/**
 * uiStore — Non-persisted UI state store (Zustand).
 *
 * Holds transient UI state: active screen, modal visibility,
 * selected items, loading flags, etc.
 *
 * This store is intentionally NOT persisted — UI state resets on launch.
 */

import { create } from 'zustand';

type ActiveView = 'guild' | 'kingdom' | 'roster' | 'dynasty' | 'settings';

interface UIStore {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  selectedAdventurerId: string | null;
  selectAdventurer: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: 'guild',
  setActiveView: (view) => { set({ activeView: view }); },
  isSettingsOpen: false,
  openSettings: () => { set({ isSettingsOpen: true }); },
  closeSettings: () => { set({ isSettingsOpen: false }); },
  selectedAdventurerId: null,
  selectAdventurer: (id) => { set({ selectedAdventurerId: id }); },
}));
