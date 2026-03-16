/**
 * VisitorCard — Displays a transient visitor at the guild house.
 *
 * Shows visitor name, tier, archetype, service request, and time remaining.
 * Three action buttons: Hold, Engage, Dismiss.
 * Uses dark theme colors and accessibility labels per project rules.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TransientVisitor } from '@idle-hero-rpg/shared';
import { TIER_COLORS } from '../utils/tierColors';
import {
  PLACEHOLDER_ENGAGE_COST,
  PLACEHOLDER_HOLD_DURATION_DAYS,
  TICKS_PER_DAY,
} from '../data/balance';

interface VisitorCardProps {
  readonly visitor: TransientVisitor;
  readonly currentTick: number;
  readonly onHold: (visitorId: string) => void;
  readonly onEngage: (visitorId: string) => void;
  readonly onDismiss: (visitorId: string) => void;
}

export function VisitorCard({
  visitor,
  currentTick,
  onHold,
  onEngage,
  onDismiss,
}: VisitorCardProps) {
  const tierColor = TIER_COLORS[visitor.tier];
  const ticksRemaining = Math.max(0, visitor.expiresAtTick - currentTick);
  const isHeld = visitor.heldUntilTick !== null && visitor.heldUntilTick > currentTick;
  const heldTicksRemaining = isHeld ? Math.max(0, (visitor.heldUntilTick ?? 0) - currentTick) : 0;
  const nextHoldDuration = Math.floor(
    (PLACEHOLDER_HOLD_DURATION_DAYS * TICKS_PER_DAY) / (visitor.holdCount + 1),
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{visitor.name}</Text>
        <Text style={[styles.tier, { color: tierColor }]}>{visitor.tier}</Text>
      </View>

      <View style={styles.details}>
        {visitor.archetype !== null && <Text style={styles.detail}>{visitor.archetype}</Text>}
        <Text style={styles.detail}>Seeking: {visitor.serviceRequest}</Text>
        <Text style={styles.timer}>
          {isHeld
            ? `Held: ${String(heldTicksRemaining)}t`
            : `Leaves in: ${String(ticksRemaining)}t`}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.button, styles.holdButton, pressed && styles.pressed]}
          onPress={() => onHold(visitor.id)}
          accessibilityLabel={`Hold ${visitor.name} for ${String(nextHoldDuration)} ticks`}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Hold ({nextHoldDuration}t)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.button, styles.engageButton, pressed && styles.pressed]}
          onPress={() => onEngage(visitor.id)}
          accessibilityLabel={`Engage ${visitor.name} for ${String(PLACEHOLDER_ENGAGE_COST)} gold`}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Engage ({PLACEHOLDER_ENGAGE_COST}g)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.button, styles.dismissButton, pressed && styles.pressed]}
          onPress={() => onDismiss(visitor.id)}
          accessibilityLabel={`Dismiss ${visitor.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#241445',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f0e8d8',
  },
  tier: {
    fontSize: 16,
    fontWeight: '700',
  },
  details: {
    marginBottom: 10,
  },
  detail: {
    fontSize: 13,
    color: '#b0a090',
    marginBottom: 2,
  },
  timer: {
    fontSize: 13,
    color: '#f0d060',
    fontWeight: '600',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  holdButton: {
    backgroundColor: '#3a2a5e',
  },
  engageButton: {
    backgroundColor: '#2a5a3a',
  },
  dismissButton: {
    backgroundColor: '#5a2a2a',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f0e8d8',
  },
});
