/**
 * EventLog — Shows the last few game events, newest first.
 */

import { StyleSheet, Text, View } from 'react-native';
import type { GameEvent } from '@idle-hero-rpg/shared';

interface EventLogProps {
  events: readonly GameEvent[];
}

export function EventLog({ events }: EventLogProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Event Log</Text>
      {events.length === 0 ? (
        <Text style={styles.placeholder}>No events yet</Text>
      ) : (
        events.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <Text style={styles.eventTick}>T{event.tick}</Text>
            <Text style={styles.eventMessage} numberOfLines={2}>
              {event.message}
            </Text>
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
  eventRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a2a4e',
    gap: 8,
  },
  eventTick: {
    fontSize: 12,
    color: '#c9b14a',
    fontWeight: '600',
    minWidth: 40,
  },
  eventMessage: {
    fontSize: 13,
    color: '#e8d8c0',
    flex: 1,
  },
});
