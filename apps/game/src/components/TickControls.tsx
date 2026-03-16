/**
 * TickControls — Play/Pause toggle, Tick Once button, tick counter.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TickControlsProps {
  isRunning: boolean;
  ticksElapsed: number;
  onTogglePlayPause: () => void;
  onTickOnce: () => void;
}

export function TickControls({
  isRunning,
  ticksElapsed,
  onTogglePlayPause,
  onTickOnce,
}: TickControlsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tick Controls</Text>
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            isRunning && styles.buttonActive,
            pressed && styles.buttonPressed,
          ]}
          onPress={onTogglePlayPause}
          accessibilityLabel={isRunning ? 'Pause game' : 'Play game'}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, isRunning && styles.buttonTextActive]}>
            {isRunning ? 'Pause' : 'Play'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onTickOnce}
          accessibilityLabel="Advance one tick"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Tick +1</Text>
        </Pressable>

        <View style={styles.tickCounter}>
          <Text style={styles.tickCounterValue}>{ticksElapsed}</Text>
          <Text style={styles.tickCounterLabel}>ticks</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a09070',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#3a2a4e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c9b14a',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  buttonActive: {
    backgroundColor: '#c9b14a',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c9b14a',
  },
  buttonTextActive: {
    color: '#1a0a2e',
  },
  tickCounter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  tickCounterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e8d8c0',
  },
  tickCounterLabel: {
    fontSize: 11,
    color: '#a09070',
  },
});
