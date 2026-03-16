/**
 * HeroCard — Displays hero name, class, and action point bar.
 */

import { StyleSheet, Text, View } from 'react-native';
import type { HeroClass } from '@idle-hero-rpg/shared';

interface HeroCardProps {
  name: string;
  heroClass: HeroClass;
  actionPoints: number;
  maxActionPoints: number;
}

export function HeroCard({ name, heroClass, actionPoints, maxActionPoints }: HeroCardProps) {
  const fillPercent = maxActionPoints > 0 ? String((actionPoints / maxActionPoints) * 100) : '0';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Hero</Text>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroClass}>{heroClass}</Text>
        </View>
        <View style={styles.apContainer}>
          <Text style={styles.apLabel}>AP {actionPoints}/{maxActionPoints}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${fillPercent}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a1a3e',
    borderRadius: 8,
    padding: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e8d8c0',
  },
  heroClass: {
    fontSize: 14,
    color: '#c9b14a',
    marginTop: 2,
  },
  apContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  apLabel: {
    fontSize: 13,
    color: '#a09070',
    marginBottom: 4,
  },
  barTrack: {
    width: '80%',
    height: 8,
    backgroundColor: '#1a0a2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#c9b14a',
    borderRadius: 4,
  },
});
