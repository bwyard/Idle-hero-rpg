/**
 * uiStore toast state — unit tests.
 *
 * TDD: these tests were written before the toast state was added to uiStore.
 * They document the expected behaviour of addToast, dismissToast, and the
 * max-3-cap eviction rule.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../uiStore';

describe('uiStore — toast notifications', () => {
  beforeEach(() => {
    // Reset store between tests by clearing all toasts
    useUIStore.setState({ toasts: [] });
  });

  describe('addToast', () => {
    it('adds a toast with the given message', () => {
      useUIStore.getState().addToast('Not enough gold to recruit');
      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.message).toBe('Not enough gold to recruit');
    });

    it('defaults type to "warning" when not specified', () => {
      useUIStore.getState().addToast('Something failed');
      const { toasts } = useUIStore.getState();
      expect(toasts[0]!.type).toBe('warning');
    });

    it('uses the provided type', () => {
      useUIStore.getState().addToast('Info message', 'info');
      useUIStore.getState().addToast('Error message', 'error');
      const { toasts } = useUIStore.getState();
      expect(toasts[0]!.type).toBe('info');
      expect(toasts[1]!.type).toBe('error');
    });

    it('assigns a unique id to each toast', () => {
      useUIStore.getState().addToast('First');
      useUIStore.getState().addToast('Second');
      const { toasts } = useUIStore.getState();
      expect(toasts[0]!.id).toBeTruthy();
      expect(toasts[1]!.id).toBeTruthy();
      expect(toasts[0]!.id).not.toBe(toasts[1]!.id);
    });

    it('toast id is prefixed with tst_', () => {
      useUIStore.getState().addToast('Test toast');
      const { toasts } = useUIStore.getState();
      expect(toasts[0]!.id.startsWith('tst_')).toBe(true);
    });
  });

  describe('max-3 cap', () => {
    it('allows up to 3 toasts at once', () => {
      useUIStore.getState().addToast('Toast 1');
      useUIStore.getState().addToast('Toast 2');
      useUIStore.getState().addToast('Toast 3');
      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(3);
    });

    it('drops the oldest toast when a 4th arrives', () => {
      useUIStore.getState().addToast('Toast 1');
      useUIStore.getState().addToast('Toast 2');
      useUIStore.getState().addToast('Toast 3');
      useUIStore.getState().addToast('Toast 4');
      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(3);
      // 'Toast 1' is the oldest — it should be gone
      expect(toasts.some((t) => t.message === 'Toast 1')).toBe(false);
      // 'Toast 4' should be present
      expect(toasts.some((t) => t.message === 'Toast 4')).toBe(true);
    });

    it('continues to drop oldest when more than 4 arrive in sequence', () => {
      useUIStore.getState().addToast('A');
      useUIStore.getState().addToast('B');
      useUIStore.getState().addToast('C');
      useUIStore.getState().addToast('D');
      useUIStore.getState().addToast('E');
      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(3);
      const messages = toasts.map((t) => t.message);
      expect(messages).toEqual(['C', 'D', 'E']);
    });
  });

  describe('dismissToast', () => {
    it('removes the toast with the given id', () => {
      useUIStore.getState().addToast('Toast to dismiss');
      const id = useUIStore.getState().toasts[0]!.id;

      useUIStore.getState().dismissToast(id);

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(0);
    });

    it('leaves other toasts untouched when dismissing one', () => {
      useUIStore.getState().addToast('Keep me');
      useUIStore.getState().addToast('Dismiss me');
      const dismissId = useUIStore.getState().toasts[1]!.id;

      useUIStore.getState().dismissToast(dismissId);

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.message).toBe('Keep me');
    });

    it('does nothing when the id does not exist', () => {
      useUIStore.getState().addToast('Toast');
      useUIStore.getState().dismissToast('tst_nonexistent');
      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
    });
  });

  describe('toast state immutability', () => {
    it('does not mutate the toasts array in place', () => {
      useUIStore.getState().addToast('First');
      const snapshot = useUIStore.getState().toasts;

      useUIStore.getState().addToast('Second');

      // snapshot must not have changed (new array was created)
      expect(snapshot).toHaveLength(1);
    });
  });
});
