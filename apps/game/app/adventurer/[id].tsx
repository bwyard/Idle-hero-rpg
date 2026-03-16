/**
 * Adventurer Detail — full detail page for a single adventurer.
 *
 * Route: /adventurer/:id
 * Reads adventurer ID from route params, looks up in gameStore.
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGameStore } from '../../src/stores/gameStore';
import { TIER_COLORS } from '../../src/utils/tierColors';
import { PLACEHOLDER_TIER_XP_THRESHOLDS, PRESTIGE_ELIGIBLE_TIERS } from '../../src/data/balance';
import type { Quest } from '@idle-hero-rpg/shared';

export default function AdventurerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useGameStore((s) => s.state);

  const adventurer = id ? state.adventurers[id] : undefined;

  if (!adventurer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Adventurer not found.</Text>
      </View>
    );
  }

  const tierColor = TIER_COLORS[adventurer.tier];
  const xpThreshold = PLACEHOLDER_TIER_XP_THRESHOLDS[adventurer.tier];
  const xpProgress = xpThreshold ? Math.min(adventurer.xp / xpThreshold, 1) : 1;
  const yearsInGuild = state.time.currentYear - adventurer.recruitedYear;
  const isPrestigeEligible = PRESTIGE_ELIGIBLE_TIERS.includes(adventurer.tier);

  // Find if adventurer is currently on a quest
  const activeQuest: Quest | undefined = Object.values(state.quests).find(
    (q) => q.assignedAdventurerId === adventurer.id && !q.isComplete,
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{adventurer.name}</Text>
        <View
          style={[styles.tierBadge, { backgroundColor: tierColor }]}
          accessibilityLabel={`Tier ${adventurer.tier}`}
          accessibilityRole="text"
        >
          <Text style={styles.tierBadgeText}>{adventurer.tier}</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Stats</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Archetype</Text>
          <Text style={styles.statValue}>{adventurer.archetype ?? 'None'}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>
            {adventurer.xp} / {xpThreshold ?? 'MAX'}
          </Text>
        </View>
        <View style={styles.xpBarBackground}>
          <View
            style={[
              styles.xpBarFill,
              { width: `${xpProgress * 100}%`, backgroundColor: tierColor },
            ]}
          />
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Years in Guild</Text>
          <Text style={styles.statValue}>{yearsInGuild}</Text>
        </View>

        {isPrestigeEligible && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Skill Borrow</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color: adventurer.skillBorrowUsed ? '#bf6a6a' : '#6a9a6a',
                },
              ]}
            >
              {adventurer.skillBorrowUsed ? 'Used this cycle' : 'Available'}
            </Text>
          </View>
        )}
      </View>

      {/* Milestones Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        {adventurer.milestones.length === 0 ? (
          <Text style={styles.placeholder}>No milestones yet</Text>
        ) : (
          adventurer.milestones.map((milestone, index) => (
            <View key={index} style={styles.milestoneRow}>
              <Text style={styles.milestoneBullet}>{'\u2022'}</Text>
              <Text style={styles.milestoneText}>{milestone}</Text>
            </View>
          ))
        )}
      </View>

      {/* Quest Status */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status</Text>
        {activeQuest ? (
          <View>
            <Text style={styles.questActiveLabel}>On Quest</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Quest ID</Text>
              <Text style={styles.statValue}>{activeQuest.templateId}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Ticks Remaining</Text>
              <Text style={styles.statValue}>{activeQuest.ticksRemaining}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.statusIdle}>Idle at guild</Text>
        )}
        {adventurer.retiredYear != null && (
          <Text style={styles.retiredLabel}>Retired in Year {adventurer.retiredYear}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#140a24',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  errorText: {
    color: '#bf6a6a',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f0e8d8',
    flexShrink: 1,
  },
  tierBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  tierBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#140a24',
  },
  card: {
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
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 15,
    color: '#b0a090',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f0e8d8',
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: '#3a2a5e',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  placeholder: {
    fontSize: 15,
    color: '#8a7a6a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  milestoneBullet: {
    fontSize: 15,
    color: '#f0d060',
    marginRight: 8,
    lineHeight: 22,
  },
  milestoneText: {
    fontSize: 15,
    color: '#f0e8d8',
    flex: 1,
    lineHeight: 22,
  },
  questActiveLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f0d060',
    marginBottom: 8,
  },
  statusIdle: {
    fontSize: 15,
    color: '#6a9a6a',
  },
  retiredLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#bf6a6a',
    marginTop: 8,
  },
});
