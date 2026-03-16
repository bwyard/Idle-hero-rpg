/**
 * GuildHeader — Displays guild name, type, and prestige count.
 */

import { StyleSheet, Text, View } from 'react-native';
import type { GuildType } from '@idle-hero-rpg/shared';

interface GuildHeaderProps {
  guildName: string;
  guildType: GuildType;
  prestigeCount: number;
}

export function GuildHeader({ guildName, guildType, prestigeCount }: GuildHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.guildName}>{guildName}</Text>
      <View style={styles.row}>
        <Text style={styles.guildType}>{guildType} Guild</Text>
        {prestigeCount > 0 && (
          <Text style={styles.prestige}>Prestige {prestigeCount}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    alignItems: 'center',
  },
  guildName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#c9b14a',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guildType: {
    fontSize: 14,
    color: '#a09070',
  },
  prestige: {
    fontSize: 14,
    color: '#c9b14a',
    fontWeight: '600',
  },
});
