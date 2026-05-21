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
  const fillPercent = maxActionPoints > 0 ? (actionPoints / maxActionPoints) * 100 : 0;

  return (
    <View style={styles.container} testID="hero-card">
      <Text style={styles.sectionTitle}>Hero</Text>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroClass}>{heroClass}</Text>
        </View>
        <View style={styles.apContainer}>
          <Text style={styles.apLabel}>
            AP {actionPoints}/{maxActionPoints}
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${String(fillPercent)}%` as `${number}%` }]} />
          </View>
        </View>
      </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  heroName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f0e8d8',
  },
  heroClass: {
    fontSize: 16,
    color: '#f0d060',
    marginTop: 4,
    fontWeight: '600',
  },
  apContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  apLabel: {
    fontSize: 15,
    color: '#d0c0a0',
    marginBottom: 6,
    fontWeight: '600',
  },
  barTrack: {
    width: '80%',
    height: 10,
    backgroundColor: '#1a0a2e',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3a2a5e',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#f0d060',
    borderRadius: 5,
  },
});
