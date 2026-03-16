/**
 * ActionButtons — Player action dispatch buttons.
 *
 * These dispatch action types that may not have handlers yet.
 * The other agent is adding RECRUIT_ADVENTURER, BUILD_BUILDING,
 * START_QUEST, and HOLD_FEAST handlers to dispatch.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ActionButtonsProps {
  onAction: (actionType: string) => void;
}

interface ActionDef {
  type: string;
  label: string;
}

const ACTIONS: readonly ActionDef[] = [
  { type: 'RECRUIT_ADVENTURER', label: 'Recruit' },
  { type: 'BUILD_BUILDING', label: 'Build' },
  { type: 'START_QUEST', label: 'Quest' },
  { type: 'HOLD_FEAST', label: 'Feast' },
];

export function ActionButtons({ onAction }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Actions</Text>
      <View style={styles.row}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.type}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => { onAction(action.type); }}
            accessibilityLabel={action.label}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>{action.label}</Text>
          </Pressable>
        ))}
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
  buttonPressed: {
    backgroundColor: '#4a3a5e',
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c9b14a',
  },
});
