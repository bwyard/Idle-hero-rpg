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
        {prestigeCount > 0 && <Text style={styles.prestige}>Prestige {prestigeCount}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a5e',
  },
  guildName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f0d060',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  guildType: {
    fontSize: 16,
    color: '#d0c0a0',
    fontWeight: '500',
  },
  prestige: {
    fontSize: 16,
    color: '#f0d060',
    fontWeight: '700',
  },
});
