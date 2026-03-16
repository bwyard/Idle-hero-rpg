/**
 * AdventurerRoster — List of guild adventurers with tappable rows.
 *
 * Each row navigates to the adventurer detail page and shows a
 * compact XP progress indicator alongside name and tier.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Adventurer } from '@idle-hero-rpg/shared';
import { TIER_COLORS } from '../utils/tierColors';
import { PLACEHOLDER_TIER_XP_THRESHOLDS } from '../data/balance';

interface AdventurerRosterProps {
  adventurers: readonly Adventurer[];
}

export function AdventurerRoster({ adventurers }: AdventurerRosterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Adventurer Roster</Text>
      {adventurers.length === 0 ? (
        <Text style={styles.placeholder}>No adventurers yet</Text>
      ) : (
        adventurers.map((adv) => {
          const tierColor = TIER_COLORS[adv.tier];
          const xpThreshold = PLACEHOLDER_TIER_XP_THRESHOLDS[adv.tier];
          const xpProgress = xpThreshold ? Math.min(adv.xp / xpThreshold, 1) : 1;

          return (
            <Pressable
              key={adv.id}
              style={({ pressed }) => [
                styles.adventurerRow,
                pressed && styles.adventurerRowPressed,
              ]}
              onPress={() => {
                router.push(`/adventurer/${adv.id}`);
              }}
              accessibilityLabel={`View ${adv.name}, tier ${adv.tier}`}
              accessibilityRole="button"
            >
              <View style={styles.rowLeft}>
                <Text style={styles.adventurerName}>{adv.name}</Text>
                <View style={styles.xpBarContainer}>
                  <View style={styles.xpBarBackground}>
                    <View
                      style={[
                        styles.xpBarFill,
                        {
                          width: `${String(xpProgress * 100)}%` as `${number}%`,
                          backgroundColor: tierColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.xpText}>
                    {adv.xp}/{xpThreshold ?? 'MAX'}
                  </Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.adventurerTier, { color: tierColor }]}>{adv.tier}</Text>
                <Text style={styles.chevron}>{'\u203A'}</Text>
              </View>
            </Pressable>
          );
        })
      )}
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
  placeholder: {
    fontSize: 16,
    color: '#8a7a6a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  adventurerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a5e',
    minHeight: 48,
  },
  adventurerRowPressed: {
    backgroundColor: '#3a2a5e',
    borderRadius: 6,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  adventurerName: {
    fontSize: 16,
    color: '#f0e8d8',
    fontWeight: '500',
  },
  xpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  xpBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#3a2a5e',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  xpText: {
    fontSize: 11,
    color: '#8a7a6a',
    minWidth: 48,
    textAlign: 'right',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adventurerTier: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
  chevron: {
    fontSize: 20,
    color: '#8a7a6a',
    marginLeft: 6,
  },
});
