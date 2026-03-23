/**
 * ToastStack — RNTL component tests.
 *
 * TDD: these tests were written before ToastStack.tsx was implemented.
 * They document the expected rendering behaviour, dismiss interactions,
 * and empty-state rendering of the toast notification stack.
 *
 * Import pattern: render from @testing-library/react-native,
 * store state managed via useUIStore.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../../stores/uiStore';
import { ToastStack } from '../ToastStack';

describe('ToastStack', () => {
  beforeEach(() => {
    // Reset toast state before each test
    useUIStore.setState({ toasts: [] });
  });

  describe('empty state', () => {
    it('renders the toast-stack container even when empty', () => {
      const { queryByTestId } = render(<ToastStack />);
      expect(queryByTestId('toast-stack')).toBeTruthy();
    });

    it('renders no dismiss buttons when toasts array is empty', () => {
      const { queryAllByTestId } = render(<ToastStack />);
      expect(queryAllByTestId(/^btn-dismiss-toast-/)).toHaveLength(0);
    });
  });

  describe('rendering toasts', () => {
    it('renders a toast with its message', () => {
      useUIStore.getState().addToast('Not enough gold to recruit');
      const { getByText } = render(<ToastStack />);
      expect(getByText('Not enough gold to recruit')).toBeTruthy();
    });

    it('renders multiple toasts', () => {
      useUIStore.getState().addToast('Toast A');
      useUIStore.getState().addToast('Toast B');
      const { getByText } = render(<ToastStack />);
      expect(getByText('Toast A')).toBeTruthy();
      expect(getByText('Toast B')).toBeTruthy();
    });

    it('renders a testID for each toast using the toast id', () => {
      useUIStore.getState().addToast('Check ID');
      const id = useUIStore.getState().toasts[0]!.id;
      const { getByTestId } = render(<ToastStack />);
      expect(getByTestId(`toast-${id}`)).toBeTruthy();
    });

    it('renders a dismiss button for each toast', () => {
      useUIStore.getState().addToast('Dismissable toast');
      const id = useUIStore.getState().toasts[0]!.id;
      const { getByTestId } = render(<ToastStack />);
      expect(getByTestId(`btn-dismiss-toast-${id}`)).toBeTruthy();
    });

    it('renders the toast-stack container', () => {
      const { getByTestId } = render(<ToastStack />);
      expect(getByTestId('toast-stack')).toBeTruthy();
    });
  });

  describe('dismiss interaction', () => {
    it('removes the toast from the store when dismiss is pressed', () => {
      useUIStore.getState().addToast('Press to dismiss');
      const id = useUIStore.getState().toasts[0]!.id;
      const { getByTestId } = render(<ToastStack />);

      fireEvent.press(getByTestId(`btn-dismiss-toast-${id}`));

      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('removes only the pressed toast, leaving others', () => {
      useUIStore.getState().addToast('Keep this');
      useUIStore.getState().addToast('Dismiss this');
      const dismissId = useUIStore.getState().toasts[1]!.id;

      const { getByTestId } = render(<ToastStack />);
      fireEvent.press(getByTestId(`btn-dismiss-toast-${dismissId}`));

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.message).toBe('Keep this');
    });
  });
});
