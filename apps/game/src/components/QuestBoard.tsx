/**
 * QuestBoard — Shows available and in-progress quests.
 *
 * Available (unassigned) quests display an "Assign" button that opens the
 * adventurer picker. In-progress quests show the assigned adventurer and
 * remaining ticks.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Quest } from '@idle-hero-rpg/shared';
import { QUEST_TEMPLATES, type QuestTemplate } from '../data/questTemplates';

interface QuestBoardProps {
  quests: readonly Quest[];
  onAssignQuest: (questId: string) => void;
}

export function QuestBoard({ quests, onAssignQuest }: QuestBoardProps) {
  const unassigned = quests.filter((q) => q.assignedAdventurerId === null && !q.isComplete);
  const inProgress = quests.filter((q) => q.assignedAdventurerId !== null && !q.isComplete);
  const completed = quests.filter((q) => q.isComplete);

  return (
    <View style={styles.container} testID="quest-board">
      <Text style={styles.sectionTitle}>Quest Board</Text>

      {unassigned.length === 0 && inProgress.length === 0 && completed.length === 0 ? (
        <Text style={styles.placeholder}>
          No quests available. Generate new quests to fill the board.
        </Text>
      ) : null}

      {unassigned.length > 0 ? (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Available</Text>
          {unassigned.map((quest) => {
            const template: QuestTemplate | undefined = QUEST_TEMPLATES[quest.templateId];
            return (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questInfo}>
                  <Text style={styles.questName}>{template?.name ?? quest.templateId}</Text>
                  <Text style={styles.questDesc} numberOfLines={2}>
                    {template?.description ?? ''}
                  </Text>
                  <Text style={styles.questMeta}>
                    {template?.region ?? 'Unknown'} | {quest.ticksRemaining} ticks
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.assignButton,
                    pressed && styles.assignButtonPressed,
                  ]}
                  onPress={() => onAssignQuest(quest.id)}
                  accessibilityLabel={`Assign adventurer to ${template?.name ?? 'quest'}`}
                  accessibilityRole="button"
                >
                  {({ pressed }) => (
                    <Text style={[styles.assignButtonText, pressed && { color: '#140a24' }]}>
                      Assign
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}

      {inProgress.length > 0 ? (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>In Progress</Text>
          {inProgress.map((quest) => {
            const template: QuestTemplate | undefined = QUEST_TEMPLATES[quest.templateId];
            return (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questInfo}>
                  <Text style={styles.questName}>{template?.name ?? quest.templateId}</Text>
                  <Text style={styles.questMeta}>{quest.ticksRemaining} ticks remaining</Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>Active</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {completed.length > 0 ? (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Completed</Text>
          {completed.map((quest) => {
            const template: QuestTemplate | undefined = QUEST_TEMPLATES[quest.templateId];
            return (
              <View key={quest.id} style={[styles.questCard, styles.questCardCompleted]}>
                <View style={styles.questInfo}>
                  <Text style={[styles.questName, styles.questNameCompleted]}>
                    {template?.name ?? quest.templateId}
                  </Text>
                </View>
                <Text style={styles.completedBadge}>Done</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#241445',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    padding: 16,
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
  subsection: {
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f0d060',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 16,
    color: '#8a7a6a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1235',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  questCardCompleted: {
    opacity: 0.6,
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f0e8d8',
    marginBottom: 2,
  },
  questNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#8a7a6a',
  },
  questDesc: {
    fontSize: 13,
    color: '#b0a090',
    marginBottom: 4,
  },
  questMeta: {
    fontSize: 12,
    color: '#8a7a6a',
  },
  assignButton: {
    backgroundColor: '#352050',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f0d060',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignButtonPressed: {
    backgroundColor: '#f0d060',
  },
  assignButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f0d060',
  },
  progressBadge: {
    backgroundColor: '#2a4040',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60d0a0',
  },
  completedBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8a7a6a',
  },
});
