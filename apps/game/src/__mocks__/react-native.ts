/**
 * react-native.ts — Minimal React Native mock for Vitest unit/component tests.
 *
 * Mocks all primitives that RNTL's host-component-detection uses (View, Text,
 * TextInput, Image, Switch, ScrollView, Modal) as well as the components
 * used by the game's tested components (Pressable, StyleSheet, etc.).
 *
 * RNTL's detectHostComponentNames renders each of these to discover their
 * react-test-renderer type strings.  Because our stubs use string element
 * names (React.createElement('View', …)) those strings become the detected
 * host component names, and RNTL's isHostText / isHostTextInput checks work.
 */

import React from 'react';

// StyleSheet mock — returns the styles object unchanged (no-op)
const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  flatten: (style: unknown) => style,
  hairlineWidth: 1,
  absoluteFill: {},
  absoluteFillObject: { top: 0, left: 0, right: 0, bottom: 0 },
};

type BaseProps = {
  children?: React.ReactNode;
  testID?: string;
  [key: string]: unknown;
};

// Generic host component stub — renders a string-typed element so that
// react-test-renderer preserves the type name in its fiber tree.
const makeComponent = (displayName: string) => {
  const Comp = ({ children, testID, ...rest }: BaseProps) =>
    React.createElement(displayName, { testID, ...rest }, children);
  Comp.displayName = displayName;
  return Comp;
};

const View = makeComponent('View');
const Text = makeComponent('Text');
const TextInput = makeComponent('TextInput');
const Image = makeComponent('Image');
const Switch = makeComponent('Switch');
const ScrollView = makeComponent('ScrollView');
const Modal = makeComponent('Modal');
const TouchableOpacity = makeComponent('TouchableOpacity');
const TouchableHighlight = makeComponent('TouchableHighlight');
const TouchableWithoutFeedback = makeComponent('TouchableWithoutFeedback');
const SafeAreaView = makeComponent('SafeAreaView');
const FlatList = makeComponent('FlatList');
const SectionList = makeComponent('SectionList');
const ActivityIndicator = makeComponent('ActivityIndicator');

// Pressable — passes through onPress so fireEvent.press works in RNTL
type PressableProps = BaseProps & {
  children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  disabled?: boolean;
};

const Pressable = ({
  children,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityRole,
  disabled,
  ...rest
}: PressableProps) => {
  const content = typeof children === 'function' ? children({ pressed: false }) : children;
  return React.createElement(
    'Pressable',
    { testID, onPress, accessibilityLabel, accessibilityRole, disabled, ...rest },
    content,
  );
};
Pressable.displayName = 'Pressable';

// Platform stub
const Platform = {
  OS: 'android' as const,
  Version: 29,
  select: <T extends Record<string, unknown>>(obj: T): unknown => obj.android ?? obj.default,
};

// Dimensions stub
const Dimensions = {
  get: (_dim: string) => ({ width: 375, height: 812 }),
  addEventListener: () => ({ remove: () => undefined }),
};

// Keyboard stub
const Keyboard = {
  dismiss: () => undefined,
  addListener: () => ({ remove: () => undefined }),
};

// Alert stub
const Alert = {
  alert: () => undefined,
};

// Animated stub (minimal) — no-op for test environment
const makeAnimatedValue = (val: number) => ({
  _val: val,
  setValue: (_v: number) => undefined,
});

const Animated = {
  View: makeComponent('Animated.View'),
  Text: makeComponent('Animated.Text'),
  Value: makeAnimatedValue,
  timing: () => ({ start: () => undefined }),
  spring: () => ({ start: () => undefined }),
  parallel: () => ({ start: () => undefined }),
  sequence: () => ({ start: () => undefined }),
};

export {
  View,
  Text,
  TextInput,
  Image,
  Switch,
  ScrollView,
  Modal,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  SafeAreaView,
  FlatList,
  SectionList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Dimensions,
  Keyboard,
  Alert,
  Animated,
};

export default {
  View,
  Text,
  TextInput,
  Image,
  Switch,
  ScrollView,
  Modal,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  SafeAreaView,
  FlatList,
  SectionList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Dimensions,
  Keyboard,
  Alert,
  Animated,
};
