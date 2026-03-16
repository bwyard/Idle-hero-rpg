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
  disabled?: boolean;
}

const ACTIONS: readonly ActionDef[] = [
  { type: 'RECRUIT_ADVENTURER', label: 'Recruit (50g)' },
  { type: 'BUILD_BUILDING', label: 'Build', disabled: true },
  { type: 'GENERATE_QUESTS', label: 'New Quests' },
  { type: 'HOLD_FEAST', label: 'Feast (75g)' },
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
              action.disabled && styles.buttonDisabled,
              !action.disabled && pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              if (!action.disabled) onAction(action.type);
            }}
            disabled={action.disabled}
            accessibilityLabel={action.disabled ? `${action.label} — coming soon` : action.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: action.disabled }}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.buttonText,
                  action.disabled && styles.buttonTextDisabled,
                  !action.disabled && pressed && { color: '#1a0a2e' },
                ]}
              >
                {action.label}
              </Text>
            )}
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
    fontSize: 14,
    fontWeight: '700',
    color: '#b0a090',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#352050',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f0d060',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  buttonPressed: {
    backgroundColor: '#f0d060',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f0d060',
  },
  buttonDisabled: {
    borderColor: '#4a3a5e',
    backgroundColor: '#1e1235',
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: '#6a5a7a',
  },
});
