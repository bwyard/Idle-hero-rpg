import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../src/stores/gameStore';
import { createId } from '@idle-hero-rpg/shared';
import { QuestBoard } from '../../src/components/QuestBoard';
import { AdventurerPicker } from '../../src/components/AdventurerPicker';

export default function BoardScreen() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);

  const [pickerQuestId, setPickerQuestId] = useState<string | null>(null);

  const adventurerList = Object.values(state.adventurers);
  const questList = Object.values(state.quests);

  const handleAssignQuest = (questId: string) => {
    setPickerQuestId(questId);
  };

  const handlePickAdventurer = (questId: string, adventurerId: string) => {
    dispatch({ type: 'START_QUEST', questId, adventurerId });
    setPickerQuestId(null);
  };

  const handleRecruit = () => {
    dispatch({ type: 'RECRUIT_ADVENTURER', name: '' } as Parameters<typeof dispatch>[0]);
  };

  const handleGenerateQuests = () => {
    dispatch({ type: 'GENERATE_QUESTS' });
  };

  return (
    <View style={styles.root} testID="board-screen">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={handleRecruit}
            accessibilityRole="button"
            accessibilityLabel="Recruit adventurer"
          >
            {({ pressed }) => (
              <Text style={[styles.actionBtnText, pressed && styles.actionBtnTextPressed]}>
                Recruit (50g)
              </Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={handleGenerateQuests}
            accessibilityRole="button"
            accessibilityLabel="Generate new quests"
          >
            {({ pressed }) => (
              <Text style={[styles.actionBtnText, pressed && styles.actionBtnTextPressed]}>
                New Quests
              </Text>
            )}
          </Pressable>
        </View>

        <QuestBoard
          quests={questList}
          adventurers={state.adventurers}
          onAssignQuest={handleAssignQuest}
        />

        <AdventurerPicker
          visible={pickerQuestId !== null}
          questId={pickerQuestId}
          adventurers={adventurerList}
          activeQuests={questList}
          onSelect={handlePickAdventurer}
          onClose={() => setPickerQuestId(null)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#140a24',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#352050',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f0d060',
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
  },
  actionBtnPressed: {
    backgroundColor: '#f0d060',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f0d060',
  },
  actionBtnTextPressed: {
    color: '#1a0a2e',
  },
});
