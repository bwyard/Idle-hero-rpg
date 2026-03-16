/**
 * StatsBar — Year counter, gold, reputation, adventurer count.
 */

import { StyleSheet, Text, View } from 'react-native';

interface StatsBarProps {
  currentYear: number;
  gold: number;
  reputation: number;
  adventurerCount: number;
  ticksElapsed: number;
  ticksPerYear: number;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function StatsBar({
  currentYear,
  gold,
  reputation,
  adventurerCount,
  ticksElapsed,
  ticksPerYear,
}: StatsBarProps) {
  const tickInYear = ticksElapsed % ticksPerYear;

  return (
    <View style={styles.container}>
      <StatItem label="Year" value={String(currentYear)} />
      <StatItem label="Gold" value={String(gold)} />
      <StatItem label="Rep" value={String(reputation)} />
      <StatItem label="Advntr" value={String(adventurerCount)} />
      <StatItem label="Tick" value={`${String(tickInYear)}/${String(ticksPerYear)}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a1a3e',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 48,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c9b14a',
  },
  statLabel: {
    fontSize: 11,
    color: '#a09070',
    marginTop: 2,
  },
});
