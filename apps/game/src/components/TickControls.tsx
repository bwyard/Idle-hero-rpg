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
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onTickOnce}
          accessibilityLabel="Advance one tick"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Tick +1</Text>
        </Pressable>

        <View style={styles.tickCounter}>
          <Text style={styles.tickCounterValue} testID="tick-count">
            {ticksElapsed}
          </Text>
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
    fontSize: 14,
    fontWeight: '700',
    color: '#b0a090',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#352050',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7a9f5a',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  buttonActive: {
    backgroundColor: '#7a9f5a',
    borderColor: '#7a9f5a',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7a9f5a',
  },
  buttonTextActive: {
    color: '#1a0a2e',
  },
  tickCounter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tickCounterValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f0e8d8',
  },
  tickCounterLabel: {
    fontSize: 13,
    color: '#b0a090',
    fontWeight: '500',
  },
});
