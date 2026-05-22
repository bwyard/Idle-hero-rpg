/**
 * RNTL vitest setup — global test configuration for React Native component tests.
 *
 * Loaded via vitest setupFiles for all tests in src/__tests__/.
 *
 * ### react-native mock strategy
 *
 * react-native/index.js uses Flow type syntax (import typeof) which esbuild
 * cannot parse. RNTL's CJS code does require("react-native") through Node's
 * native module loader, bypassing Vite's resolve.alias and vi.mock.
 *
 * We patch Module._load directly to intercept the react-native require at the
 * Node module system level. The mock is defined inline here to avoid a
 * secondary require() call (which would also fail on TypeScript syntax in the
 * mock file before vite-node patches require.extensions).
 */

import { vi } from 'vitest';
import React from 'react';
import Module from 'module';

// Inline react-native mock — primitive components RNTL needs to render.
// RNTL's detectHostComponentNames() renders View, Text, TextInput, Image,
// Switch, ScrollView, and Modal on first render() call; all must be present.
const reactNativeMock = {
  StyleSheet: {
    create: <T>(styles: T): T => styles,
    flatten: (style: unknown) => style,
    hairlineWidth: 1,
    absoluteFill: {},
    absoluteFillObject: { top: 0, left: 0, bottom: 0, right: 0 },
  },

  View: ({
    children,
    testID,
    style: _s,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode; testID?: string }) =>
    React.createElement('View', { testID, ...rest }, children),

  Text: ({
    children,
    testID,
    style: _s,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode; testID?: string }) =>
    React.createElement('Text', { testID, ...rest }, children),

  TextInput: ({ testID, style: _s, ...rest }: Record<string, unknown> & { testID?: string }) =>
    React.createElement('TextInput', { testID, ...rest }),

  Image: ({ testID, style: _s, ...rest }: Record<string, unknown> & { testID?: string }) =>
    React.createElement('Image', { testID, ...rest }),

  Switch: ({ testID, style: _s, ...rest }: Record<string, unknown> & { testID?: string }) =>
    React.createElement('Switch', { testID, ...rest }),

  ScrollView: ({
    children,
    testID,
    style: _s,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode; testID?: string }) =>
    React.createElement('ScrollView', { testID, ...rest }, children),

  Modal: ({
    children,
    testID,
    style: _s,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode; testID?: string }) =>
    React.createElement('Modal', { testID, ...rest }, children),

  TouchableOpacity: ({
    children,
    testID,
    onPress,
    style: _s,
    ...rest
  }: Record<string, unknown> & {
    children?: React.ReactNode;
    testID?: string;
    onPress?: () => void;
  }) => React.createElement('TouchableOpacity', { testID, onPress, ...rest }, children),

  get Pressable() {
    return this.TouchableOpacity;
  },

  LogBox: { ignoreLogs: () => {}, ignoreAllLogs: () => {} },

  Platform: {
    OS: 'ios' as const,
    select: <T extends Record<string, unknown>>(obj: T): T[keyof T] =>
      (obj['ios'] ?? obj['default']) as T[keyof T],
  },
};

// In-memory MMKV mock — shared across all tests in a run.
// The storage is only ever accessed via the injectable KVStorage interface
// in production tests (gameStore, storage) so cross-test pollution is not
// a concern here.
//
// MMKV is typed as a class in the real module, but we model it here as a
// plain constructor function (function expression, not class — per ESLint rules).
// new MMKVMock() returns the object literal, which is correct JS behaviour.
const mmkvStore = new Map<string, string>();
const mmkvMock = {
  MMKV: function MMKVMock() {
    return {
      getString: (key: string): string | undefined => mmkvStore.get(key),
      set: (key: string, value: string): void => {
        mmkvStore.set(key, value);
      },
      delete: (key: string): void => {
        mmkvStore.delete(key);
      },
    };
  },
};

// Patch Node's module loader to redirect native module requires to our mocks.
// Using _load directly ensures we intercept both native and vite-node paths,
// including dynamic require() calls inside factory functions (platformStorage).
const _originalLoad = (
  Module as unknown as { _load: (request: string, ...args: unknown[]) => unknown }
)._load;
(Module as unknown as { _load: (request: string, ...args: unknown[]) => unknown })._load =
  function (request: string, ...args: unknown[]) {
    if (request === 'react-native') return reactNativeMock;
    if (request === 'react-native-mmkv') return mmkvMock;
    return _originalLoad(request, ...args);
  };

// NOTE: react-native-mmkv is handled above via Module._load — vi.mock not needed.

vi.mock('expo-router', () => {
  const replace = vi.fn();
  const Tabs = Object.assign(({ children }: { children: React.ReactNode }) => children, {
    Screen: () => null,
  });
  return {
    router: { replace, push: vi.fn(), back: vi.fn() },
    useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
    useLocalSearchParams: () => ({}),
    usePathname: () => '/',
    Link: ({ children }: { children: React.ReactNode }) => children,
    Redirect: ({ href }: { href: string }) => {
      replace(href);
      return null;
    },
    Stack: { Screen: () => null },
    Tabs,
  };
});
