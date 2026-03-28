/**
 * visitor-queue — Player-facing screen for approving or denying visitor service requests.
 *
 * Shows all current transient visitors from the game store. Each visitor card
 * displays their name, tier, archetype, service request, service fee, and time
 * remaining. The player can approve (collect fee, hold visitor for service) or
 * deny (remove immediately) each request.
 *
 * testIDs:
 *   visitor-queue              — root scroll container
 *   visitor-queue-empty        — empty state message
 *   visitor-card-{id}          — card for a specific visitor
 *   btn-approve-{id}           — approve button for a specific visitor
 *   btn-deny-{id}              — deny button for a specific visitor
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../src/stores/gameStore';
import type { TransientVisitor } from '@idle-hero-rpg/shared';
import { truncateText } from '../src/utils/truncateText';

// ─── Visitor Card ────────────────────────────────────────────────────────────

interface VisitorCardProps {
  readonly visitor: TransientVisitor;
  readonly ticksElapsed: number;
  readonly onApprove: (visitorId: string) => void;
  readonly onDeny: (visitorId: string) => void;
}

function VisitorCard({ visitor, ticksElapsed, onApprove, onDeny }: VisitorCardProps) {
  const ticksRemaining = visitor.expiresAtTick - ticksElapsed;
  const daysRemaining = Math.max(0, Math.ceil(ticksRemaining / 4));

  return (
    <View style={styles.card} testID={`visitor-card-${visitor.id}`}>
      <View style={styles.cardHeader}>
        <Text style={styles.visitorName}>{truncateText(visitor.name)}</Text>
        <Text style={styles.visitorTier}>{visitor.tier}</Text>
      </View>

      {visitor.archetype !== null && <Text style={styles.detail}>{visitor.archetype}</Text>}

      <Text style={styles.serviceRequest}>Seeking: {visitor.serviceRequest}</Text>
      <Text style={styles.serviceFee}>Fee: {visitor.serviceFee} gold</Text>
      <Text style={styles.timeRemaining}>
        {daysRemaining > 0
          ? `${String(daysRemaining)} day${daysRemaining === 1 ? '' : 's'} remaining`
          : 'Departing soon'}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={() => {
            onApprove(visitor.id);
          }}
          testID={`btn-approve-${visitor.id}`}
          accessibilityLabel={`Approve ${visitor.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.denyButton]}
          onPress={() => {
            onDeny(visitor.id);
          }}
          testID={`btn-deny-${visitor.id}`}
          accessibilityLabel={`Deny ${visitor.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.denyButtonText}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function VisitorQueueScreen() {
  const transientVisitors = useGameStore((s) => s.state.transientVisitors);
  const ticksElapsed = useGameStore((s) => s.state.time.ticksElapsed);
  const dispatch = useGameStore((s) => s.dispatch);

  const visitorList = Object.values(transientVisitors);

  const handleApprove = (visitorId: string) => {
    dispatch({ type: 'APPROVE_VISITOR', visitorId });
  };

  const handleDeny = (visitorId: string) => {
    dispatch({ type: 'DENY_VISITOR', visitorId });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="visitor-queue"
    >
      <Text style={styles.heading}>Visitor Queue</Text>

      {visitorList.length === 0 ? (
        <View style={styles.emptyState} testID="visitor-queue-empty">
          <Text style={styles.emptyText}>No visitors at the guild house.</Text>
          <Text style={styles.emptySubtext}>Check back after the next tick.</Text>
        </View>
      ) : (
        visitorList.map((visitor) => (
          <VisitorCard
            key={visitor.id}
            visitor={visitor}
            ticksElapsed={ticksElapsed}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        ))
      )}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0818',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f0d060',
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8a7a60',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#4a3f60',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#1a0f30',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a2f50',
    padding: 14,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitorName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#f0e8d8',
  },
  visitorTier: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f0d060',
    backgroundColor: '#2a1a40',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  detail: {
    fontSize: 13,
    color: '#8a7a60',
    fontStyle: 'italic',
  },
  serviceRequest: {
    fontSize: 14,
    color: '#c0b0a0',
  },
  serviceFee: {
    fontSize: 14,
    color: '#a0d080',
    fontWeight: '600',
  },
  timeRemaining: {
    fontSize: 12,
    color: '#7a6a50',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#2a6040',
    borderWidth: 1,
    borderColor: '#4a9060',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#a0e0b0',
  },
  denyButton: {
    backgroundColor: '#3a1020',
    borderWidth: 1,
    borderColor: '#702030',
  },
  denyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e08090',
  },
});
