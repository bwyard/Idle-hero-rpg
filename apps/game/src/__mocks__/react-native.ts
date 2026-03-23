/**
 * Minimal react-native mock for Vitest component tests.
 *
 * react-native/index.js uses Flow type syntax (import typeof) which esbuild
 * cannot parse. This mock provides the primitives used by screens/components
 * under test, implemented as plain React components that RNTL can render.
 *
 * Usage: add this at the top of each test file that imports RNTL:
 *
 *   vi.mock('react-native', async () => import('../../__mocks__/react-native'));
 *
 * vi.mock is hoisted by Vitest before static imports, so RNTL's CJS
 * require("react-native") gets this mock instead of the real Flow-typed source.
 *
 * Add component entries here as new native components are tested.
 */

import React from 'react';

// Minimal StyleSheet — returns the object as-is (no native style resolution)
export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  flatten: (style: unknown) => style,
  hairlineWidth: 1,
  absoluteFill: {},
  absoluteFillObject: { top: 0, left: 0, bottom: 0, right: 0 },
};

type NodeProps = {
  children?: React.ReactNode;
  testID?: string;
  style?: unknown;
  [key: string]: unknown;
};

// Primitive components — pass-through wrappers that RNTL can query by testID
export const View = ({ children, testID, style: _style, ...rest }: NodeProps) =>
  React.createElement('View', { testID, ...rest }, children);

export const Text = ({ children, testID, style: _style, ...rest }: NodeProps) =>
  React.createElement('Text', { testID, ...rest }, children);

export const TextInput = ({ testID, style: _style, ...rest }: NodeProps) =>
  React.createElement('TextInput', { testID, ...rest });

export const Image = ({ testID, style: _style, ...rest }: NodeProps) =>
  React.createElement('Image', { testID, ...rest });

export const Switch = ({ testID, style: _style, ...rest }: NodeProps) =>
  React.createElement('Switch', { testID, ...rest });

export const ScrollView = ({ children, testID, style: _style, ...rest }: NodeProps) =>
  React.createElement('ScrollView', { testID, ...rest }, children);

export const Modal = ({ children, testID, style: _style, ...rest }: NodeProps) =>
  React.createElement('Modal', { testID, ...rest }, children);

export const TouchableOpacity = ({
  children,
  testID,
  onPress,
  style: _style,
  ...rest
}: NodeProps & { onPress?: () => void }) =>
  React.createElement('TouchableOpacity', { testID, onPress, ...rest }, children);

export const Pressable = TouchableOpacity;

export const LogBox = {
  ignoreLogs: () => {},
  ignoreAllLogs: () => {},
};

export const Platform = {
  OS: 'ios' as const,
  select: <T extends Record<string, unknown>>(obj: T): T[keyof T] =>
    (obj.ios ?? obj.default) as T[keyof T],
};
