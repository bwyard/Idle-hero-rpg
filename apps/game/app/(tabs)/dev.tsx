/**
 * Dev tab — only rendered in __DEV__ builds.
 *
 * Provides fast-forward controls, gold injection, and tier overrides for
 * testing game loops without waiting through real-time progression.
 *
 * This file is safe to import in production — the tab is hidden by _layout.tsx
 * when __DEV__ is false.
 */

import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useGameStore } from '../../src/stores/gameStore';
import { tick } from '../../src/engine/tick';
import type { AdventurerTier } from '@idle-hero-rpg/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tier options for the force-tier buttons. */
const TIER_OPTIONS: readonly AdventurerTier[] = ['C', 'B', 'A', 'S', 'SS', 'Legendary'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { readonly title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function DevBtn({
  label,
  onPress,
  danger,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        danger && styles.btnDanger,
        pressed && styles.btnPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <Text style={[styles.btnText, pressed && styles.btnTextPressed]}>{label}</Text>
      )}
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DevScreen() {
  const state = useGameStore((s) => s.state);
  const setState = useGameStore((s) => s._devSetState);
  const dispatch = useGameStore((s) => s.dispatch);

  // Fast-forward: run N ticks at once
  const fastTick = (count: number) => {
    let next = state;
    for (let i = 0; i < count; i++) next = tick(next);
    setState(next);
  };

  // Give gold directly to guild
  const giveGold = (amount: number) => {
    setState({ ...state, guild: { ...state.guild, gold: state.guild.gold + amount } });
  };

  // Force first adventurer to a tier (for testing prestige conditions)
  const forceTier = (tier: AdventurerTier) => {
    const entries = Object.entries(state.adventurers);
    if (entries.length === 0) return;
    const [id, adv] = entries[0]!;
    setState({
      ...state,
      adventurers: { ...state.adventurers, [id]: { ...adv, tier, xp: 0 } },
    });
  };

  // Force prestige flag on so the dynasty screen activates immediately
  const forcePrestigeFlag = () => {
    setState({
      ...state,
      flags: { ...state.flags, prestigeAvailable: true },
    });
  };

  const adventurerList = Object.values(state.adventurers);

  return (
    <View style={styles.root} testID="dev-screen">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.warning}>⚠ Dev tools — not visible in production builds</Text>

        {/* ── State summary ── */}
        <View style={styles.section}>
          <SectionHeader title="Current State" />
          <Text style={styles.stat}>Tick: {state.time.ticksElapsed}</Text>
          <Text style={styles.stat}>
            Year {state.time.currentYear}, Day {state.time.currentDay} ({state.time.currentSeason})
          </Text>
          <Text style={styles.stat}>Gold: {state.guild.gold}</Text>
          <Text style={styles.stat}>Adventurers: {adventurerList.length}</Text>
          <Text style={styles.stat}>
            Prestige: {state.dynasty.prestigeCount} ({state.dynasty.worldAwarenessTier})
          </Text>
          <Text style={styles.stat}>
            prestigeAvailable: {String(state.flags.prestigeAvailable)}
          </Text>
        </View>

        {/* ── Fast tick ── */}
        <View style={styles.section}>
          <SectionHeader title="Fast Forward" />
          <View style={styles.row}>
            <DevBtn
              label="+10 ticks"
              onPress={() => {
                fastTick(10);
              }}
            />
            <DevBtn
              label="+100 ticks"
              onPress={() => {
                fastTick(100);
              }}
            />
            <DevBtn
              label="+1000 ticks"
              onPress={() => {
                fastTick(1000);
              }}
            />
          </View>
        </View>

        {/* ── Gold injection ── */}
        <View style={styles.section}>
          <SectionHeader title="Give Gold" />
          <View style={styles.row}>
            <DevBtn
              label="+500g"
              onPress={() => {
                giveGold(500);
              }}
            />
            <DevBtn
              label="+5000g"
              onPress={() => {
                giveGold(5000);
              }}
            />
            <DevBtn
              label="+50000g"
              onPress={() => {
                giveGold(50000);
              }}
            />
          </View>
        </View>

        {/* ── Tier override ── */}
        <View style={styles.section}>
          <SectionHeader title="Force First Adventurer Tier" />
          {adventurerList.length === 0 ? (
            <Text style={styles.empty}>No adventurers — recruit first</Text>
          ) : (
            <>
              <Text style={styles.stat}>
                Target: {adventurerList[0]?.name} (currently {adventurerList[0]?.tier})
              </Text>
              <View style={styles.tierRow}>
                {TIER_OPTIONS.map((tier) => (
                  <DevBtn
                    key={tier}
                    label={tier}
                    onPress={() => {
                      forceTier(tier);
                    }}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* ── Prestige ── */}
        <View style={styles.section}>
          <SectionHeader title="Prestige" />
          <DevBtn label="Force prestige flag on" onPress={forcePrestigeFlag} />
        </View>

        {/* ── Actions ── */}
        <View style={styles.section}>
          <SectionHeader title="Actions" />
          <View style={styles.row}>
            <DevBtn
              label="Recruit"
              onPress={() => {
                dispatch({ type: 'RECRUIT_ADVENTURER' });
              }}
            />
            <DevBtn
              label="Generate Quests"
              onPress={() => {
                dispatch({ type: 'GENERATE_QUESTS' });
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a14' },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, maxWidth: 480, alignSelf: 'center', width: '100%' },
  warning: {
    fontSize: 12,
    color: '#f08030',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#607060',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  stat: { fontSize: 14, color: '#90c090', marginBottom: 4, fontFamily: 'monospace' },
  empty: { fontSize: 13, color: '#4a5a4a', fontStyle: 'italic' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  btn: {
    backgroundColor: '#1a2a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304030',
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDanger: { borderColor: '#602020' },
  btnPressed: { backgroundColor: '#304030' },
  btnText: { fontSize: 13, fontWeight: '600', color: '#80c080' },
  btnTextPressed: { color: '#f0f0f0' },
});
