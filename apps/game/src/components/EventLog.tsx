/**
 * EventLog — Shows the last few game events, newest first.
 */

import { StyleSheet, Text, View } from 'react-native';
import type { GameEvent } from '@idle-hero-rpg/shared';
import { truncateText } from '../utils/truncateText';

interface EventLogProps {
  events: readonly GameEvent[];
}

export function EventLog({ events }: EventLogProps) {
  return (
    <View style={styles.container} testID="event-log">
      <Text style={styles.sectionTitle}>Event Log</Text>
      {events.length === 0 ? (
        <Text style={styles.placeholder}>No events yet</Text>
      ) : (
        events.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <Text style={styles.eventTick}>T{event.tick}</Text>
            <Text style={styles.eventMessage} numberOfLines={2}>
              {truncateText(event.message)}
            </Text>
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
  eventRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a5e',
    gap: 12,
  },
  eventTick: {
    fontSize: 14,
    color: '#f0d060',
    fontWeight: '700',
    minWidth: 48,
  },
  eventMessage: {
    fontSize: 15,
    color: '#e0d8c8',
    flex: 1,
  },
});
