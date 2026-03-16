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
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a5e',
  },
  adventurerName: {
    fontSize: 16,
    color: '#f0e8d8',
    fontWeight: '500',
  },
  adventurerTier: {
    fontSize: 16,
    color: '#f0d060',
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
});
