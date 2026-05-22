/**
 * platformStorage — Concrete KVStorage implementation for the current platform.
 *
 * - Web: delegates to localStorage (Expo Web / browser dev)
 * - Native: delegates to react-native-mmkv (fast synchronous storage)
 *
 * Uses a lazy memoised getter so the native module is never required on web
 * and the MMKV instance is created exactly once per process lifetime.
 *
 * Never import this from test files — tests inject KVStorage directly via
 * initFromStorage(storage) and storage.test.ts's own in-memory mock.
 */

import { Platform } from 'react-native';
import type { KVStorage } from './storage';

/** Minimal localStorage interface — typed without DOM lib. */
interface WebStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

let _instance: KVStorage | null = null;

export const getPlatformStorage = (): KVStorage => {
  if (_instance !== null) return _instance;

  if (Platform.OS === 'web') {
    const ls = (globalThis as { localStorage: WebStorage }).localStorage;
    _instance = {
      getString: (key: string) => ls.getItem(key) ?? undefined,
      set: (key: string, value: string) => {
        ls.setItem(key, value);
      },
      delete: (key: string) => {
        ls.removeItem(key);
      },
    };
    return _instance;
  }

  // Native — lazy-require to prevent module init on web.
  // The cast lets TypeScript type-check callers without importing the native module.
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const store = new MMKV();
  _instance = {
    getString: (key: string) => store.getString(key),
    set: (key: string, value: string) => {
      store.set(key, value);
    },
    delete: (key: string) => {
      store.delete(key);
    },
  };
  return _instance;
};
