/**
 * AdventurerPicker — Modal overlay for selecting an adventurer to assign to a quest.
 *
 * Shows available (not currently on a quest) adventurers. Tapping one dispatches
 * START_QUEST with the selected quest and adventurer IDs.
 */

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Adventurer, Quest } from '@idle-hero-rpg/shared';

interface AdventurerPickerProps {
  visible: boolean;
  questId: string | null;
  adventurers: readonly Adventurer[];
  activeQuests: readonly Quest[];
  onSelect: (questId: string, adventurerId: string) => void;
  onClose: () => void;
}

export function AdventurerPicker({
  visible,
  questId,
  adventurers,
  activeQuests,
  onSelect,
  onClose,
}: AdventurerPickerProps) {
  // Adventurers currently on a quest are unavailable
  const busyAdventurerIds = new Set(
    activeQuests
      .filter((q) => q.assignedAdventurerId !== null && !q.isComplete)
      .map((q) => q.assignedAdventurerId as string),
  );

  const available = adventurers.filter(
    (a) => a.retiredYear === null && !busyAdventurerIds.has(a.id),
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Choose Adventurer</Text>

          {available.length === 0 ? (
            <Text style={styles.emptyText}>No adventurers available</Text>
          ) : (
            available.map((adv) => (
              <Pressable
                key={adv.id}
                style={({ pressed }) => [
                  styles.adventurerRow,
                  pressed && styles.adventurerRowPressed,
                ]}
                onPress={() => {
                  if (questId) onSelect(questId, adv.id);
                }}
                accessibilityLabel={`Assign ${adv.name} (${adv.tier} ${adv.archetype ?? 'Unknown'})`}
                accessibilityRole="button"
              >
                <View style={styles.adventurerInfo}>
                  <Text style={styles.adventurerName}>{adv.name}</Text>
                  <Text style={styles.adventurerMeta}>
                    {adv.tier} | {adv.archetype ?? 'None'}
                  </Text>
                </View>
                <Text style={styles.selectText}>Select</Text>
              </Pressable>
            ))
          )}

          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            onPress={onClose}
            accessibilityLabel="Close adventurer picker"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#241445',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3a2a5e',
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0d060',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8a7a6a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  adventurerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1235',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    padding: 12,
    marginBottom: 8,
    minHeight: 48,
    gap: 12,
  },
  adventurerRowPressed: {
    backgroundColor: '#352050',
    borderColor: '#f0d060',
  },
  adventurerInfo: {
    flex: 1,
  },
  adventurerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f0e8d8',
  },
  adventurerMeta: {
    fontSize: 13,
    color: '#b0a090',
    marginTop: 2,
  },
  selectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f0d060',
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#352050',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3a2a5e',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  closeButtonPressed: {
    borderColor: '#f0d060',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b0a090',
  },
});
