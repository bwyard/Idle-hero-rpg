/**
 * ToastStack — Renders the current toast notification stack.
 *
 * Reads toasts from uiStore and renders them in a fixed stack at the
 * bottom of the screen. Each toast is dismissable on press and
 * auto-dismisses after TOAST_DURATION_MS.
 *
 * testIDs: toast-stack, toast-{id}, btn-dismiss-toast-{id}
 */

import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUIStore } from '../stores/uiStore';
import type { Toast } from '../stores/uiStore';
import { TOAST_DURATION_MS } from '../data/balance';

function ToastItem({ toast }: { readonly toast: Toast }) {
  const dismissToast = useUIStore((s) => s.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      dismissToast(toast.id);
    }, TOAST_DURATION_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, dismissToast]);

  return (
    <View testID={`toast-${toast.id}`} style={[styles.toast, toastTypeStyle[toast.type]]}>
      <Text style={styles.toastText} numberOfLines={2}>
        {toast.message}
      </Text>
      <Pressable
        testID={`btn-dismiss-toast-${toast.id}`}
        onPress={() => {
          dismissToast(toast.id);
        }}
        style={styles.dismissButton}
        accessibilityLabel="Dismiss notification"
        accessibilityRole="button"
      >
        <Text style={styles.dismissText}>✕</Text>
      </Pressable>
    </View>
  );
}

export function ToastStack() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <View testID="toast-stack" style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

const toastTypeStyle: Record<Toast['type'], object> = {
  info: { borderLeftColor: '#60a5fa' },
  warning: { borderLeftColor: '#f0d060' },
  error: { borderLeftColor: '#f87171' },
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    gap: 8,
    zIndex: 999,
  },
  toast: {
    backgroundColor: '#1e1235',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    borderLeftWidth: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toastText: {
    color: '#f0e8d0',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  dismissButton: {
    padding: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: '#8a7a6a',
    fontSize: 14,
    fontWeight: '700',
  },
});
