/**
 * StatsBar — Season, day, year counter, gold, reputation, adventurer count.
 */

import { StyleSheet, Text, View } from 'react-native';
import type { Season } from '@idle-hero-rpg/shared';
import { DAYS_PER_YEAR } from '../data/balance';

interface StatsBarProps {
  currentYear: number;
  currentDay: number;
  currentSeason: Season;
  gold: number;
  reputation: number;
  adventurerCount: number;
}

function StatItem({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue} testID={testID}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function StatsBar({
  currentYear,
  currentDay,
  currentSeason,
  gold,
  reputation,
  adventurerCount,
}: StatsBarProps) {
  const dayOfYear = (currentDay % DAYS_PER_YEAR) + 1; // 1-indexed for display

  return (
    <View style={styles.container}>
      <StatItem label={currentSeason} value={`Y${String(currentYear + 1)}`} />
      <StatItem label="Day" value={`${String(dayOfYear)}/${String(DAYS_PER_YEAR)}`} />
      <StatItem label="Gold" value={String(gold)} testID="stats-gold" />
      <StatItem label="Rep" value={String(reputation)} />
      <StatItem label="Advntr" value={String(adventurerCount)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#241445',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 56,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f0d060',
  },
  statLabel: {
    fontSize: 13,
    color: '#b0a090',
    marginTop: 4,
    fontWeight: '500',
  },
});
