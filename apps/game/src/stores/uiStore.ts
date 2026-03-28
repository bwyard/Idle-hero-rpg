/**
 * uiStore — Non-persisted UI state store (Zustand).
 *
 * Holds transient UI state: active screen, modal visibility,
 * selected items, loading flags, toast notifications, etc.
 *
 * This store is intentionally NOT persisted — UI state resets on launch.
 */

import { create } from 'zustand';
import { createId } from '@idle-hero-rpg/shared';
import { TOAST_MAX_COUNT } from '../data/balance';

type ActiveView = 'guild' | 'kingdom' | 'roster' | 'dynasty' | 'settings';

export type Toast = {
  readonly id: string;
  readonly message: string;
  readonly type: 'info' | 'warning' | 'error';
};

interface UIStore {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  selectedAdventurerId: string | null;
  selectAdventurer: (id: string | null) => void;
  toasts: readonly Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeView: 'guild',
  setActiveView: (view) => {
    set({ activeView: view });
  },
  isSettingsOpen: false,
  openSettings: () => {
    set({ isSettingsOpen: true });
  },
  closeSettings: () => {
    set({ isSettingsOpen: false });
  },
  selectedAdventurerId: null,
  selectAdventurer: (id) => {
    set({ selectedAdventurerId: id });
  },

  toasts: [],

  addToast: (message, type = 'warning') => {
    set((store) => {
      const newToast: Toast = {
        id: createId('tst'),
        message,
        type,
      };
      const updated = [...store.toasts, newToast];
      // Cap at TOAST_MAX_COUNT — drop oldest from the front
      const capped =
        updated.length > TOAST_MAX_COUNT
          ? updated.slice(updated.length - TOAST_MAX_COUNT)
          : updated;
      return { toasts: capped };
    });
  },

  dismissToast: (id) => {
    set((store) => ({
      toasts: store.toasts.filter((t) => t.id !== id),
    }));
  },
}));
