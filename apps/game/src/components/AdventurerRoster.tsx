/**
 * AdventurerRoster — List of guild adventurers with empty state placeholder.
 */

import { StyleSheet, Text, View } from 'react-native';
import type { Adventurer } from '@idle-hero-rpg/shared';

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
        adventurers.map((adv) => (
          <View key={adv.id} style={styles.adventurerRow}>
            <Text style={styles.adventurerName}>{adv.name}</Text>
            <Text style={styles.adventurerTier}>{adv.tier}</Text>
          </View>
        ))
      )}
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
  placeholder: {
    fontSize: 14,
    color: '#a09070',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  adventurerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a2a4e',
  },
  adventurerName: {
    fontSize: 14,
    color: '#e8d8c0',
  },
  adventurerTier: {
    fontSize: 14,
    color: '#c9b14a',
    fontWeight: '600',
  },
});
