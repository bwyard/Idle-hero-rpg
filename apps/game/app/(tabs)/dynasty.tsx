import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../src/stores/gameStore';
import { PRESTIGE_ELIGIBLE_TIERS } from '../../src/data/balance';
import type { Adventurer } from '@idle-hero-rpg/shared';

// ─── Successor picker modal ───────────────────────────────────────────────────

interface SuccessorPickerProps {
  readonly visible: boolean;
  readonly successors: readonly Adventurer[];
  readonly onPick: (id: string) => void;
  readonly onClose: () => void;
}

function SuccessorPicker({ visible, successors, onPick, onClose }: SuccessorPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={pickerStyles.overlay}>
        <View style={pickerStyles.sheet}>
          <Text style={pickerStyles.title}>Choose Your Successor</Text>
          <Text style={pickerStyles.subtitle}>
            Their archetype determines the new hero class. Higher tier = greater dynasty bonus.
          </Text>
          <ScrollView>
            {successors.map((adv) => (
              <Pressable
                key={adv.id}
                style={({ pressed }) => [pickerStyles.row, pressed && pickerStyles.rowPressed]}
                onPress={() => {
                  onPick(adv.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Choose ${adv.name} as successor`}
              >
                <View>
                  <Text style={pickerStyles.advName}>{adv.name}</Text>
                  <Text style={pickerStyles.advMeta}>{adv.archetype ?? 'Unknown'}</Text>
                </View>
                <Text style={pickerStyles.tier}>{adv.tier}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={pickerStyles.cancel} onPress={onClose} accessibilityRole="button">
            <Text style={pickerStyles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DynastyScreen() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const [pickerOpen, setPickerOpen] = useState(false);

  const successors = Object.values(state.adventurers).filter(
    (a) => a.retiredYear === null && PRESTIGE_ELIGIBLE_TIERS.includes(a.tier),
  );

  const handlePrestige = (successorId: string) => {
    setPickerOpen(false);
    dispatch({ type: 'PRESTIGE', successorAdventurerId: successorId });
  };

  return (
    <View style={styles.root} testID="dynasty-screen">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* ── Prestige banner ── */}
        {state.flags.prestigeAvailable && (
          <Pressable
            style={({ pressed }) => [
              styles.prestigeBanner,
              pressed && styles.prestigeBannerPressed,
            ]}
            onPress={() => {
              setPickerOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Prestige — choose your successor"
            testID="prestige-banner"
          >
            <Text style={styles.bannerTitle}>Prestige Available</Text>
            <Text style={styles.bannerSub}>
              A worthy successor has emerged. Tap to hand over the torch.
            </Text>
          </Pressable>
        )}

        {/* ── Dynasty stats ── */}
        <View style={styles.section} testID="dynasty-info">
          <Text style={styles.sectionTitle}>Dynasty</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Prestige</Text>
            <Text style={styles.statValue}>{state.dynasty.prestigeCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>World Standing</Text>
            <Text style={styles.statValue}>{state.dynasty.worldAwarenessTier}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Leader</Text>
            <Text style={styles.statValue}>
              {state.hero.name} ({state.hero.heroClass})
            </Text>
          </View>
        </View>

        {/* ── Guild score ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guild Score</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>—</Text>
              <Text style={styles.scoreLabel}>Guild Rank</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{state.guild.reputation}</Text>
              <Text style={styles.scoreLabel}>Reputation</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>—</Text>
              <Text style={styles.scoreLabel}>Dynasty Power</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>???</Text>
              <Text style={styles.scoreLabel}>Survivor's Mark</Text>
            </View>
          </View>
        </View>

        {/* ── Hall of Heroes ── */}
        <View style={styles.section} testID="hall-of-heroes">
          <Text style={styles.sectionTitle}>Hall of Heroes</Text>
          {state.dynasty.hallOfHeroes.length === 0 ? (
            <Text style={styles.placeholder}>Unlocks after first prestige</Text>
          ) : (
            state.dynasty.hallOfHeroes.map((entry) => (
              <View key={entry.adventurerId} style={styles.heroRow}>
                <View>
                  <Text style={styles.heroName}>{entry.name}</Text>
                  <Text style={styles.heroMeta}>
                    {entry.heroClass} · Run {entry.runIndex + 1}
                  </Text>
                </View>
                <Text style={styles.heroTier}>{entry.highestTierReached}</Text>
              </View>
            ))
          )}
        </View>

        {/* ── Manual prestige button (when eligible but banner dismissed) ── */}
        {successors.length > 0 && (
          <Pressable
            style={({ pressed }) => [styles.prestigeBtn, pressed && styles.prestigeBtnPressed]}
            onPress={() => {
              setPickerOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Choose successor"
            testID="choose-successor-btn"
          >
            {({ pressed }) => (
              <Text style={[styles.prestigeBtnText, pressed && styles.prestigeBtnTextPressed]}>
                {state.flags.prestigeAvailable
                  ? 'Prestige Now'
                  : `${successors.length} eligible successor${successors.length > 1 ? 's' : ''}`}
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>

      <SuccessorPicker
        visible={pickerOpen}
        successors={successors}
        onPick={handlePrestige}
        onClose={() => {
          setPickerOpen(false);
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#140a24' },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, maxWidth: 480, alignSelf: 'center', width: '100%' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b0a090',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a5e',
  },
  statLabel: { fontSize: 15, color: '#d0c0a0' },
  statValue: { fontSize: 15, fontWeight: '700', color: '#f0d060' },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scoreCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#241445',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    padding: 14,
    alignItems: 'center',
  },
  scoreValue: { fontSize: 24, fontWeight: 'bold', color: '#f0d060', marginBottom: 4 },
  scoreLabel: { fontSize: 12, color: '#b0a090', textAlign: 'center' },
  placeholder: {
    fontSize: 14,
    color: '#8a7a6a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#241445',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  heroName: { fontSize: 16, fontWeight: '600', color: '#f0e8d8' },
  heroMeta: { fontSize: 13, color: '#b0a090', marginTop: 2 },
  heroTier: { fontSize: 18, fontWeight: '800', color: '#f0d060' },
  prestigeBanner: {
    backgroundColor: '#4a2010',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0a030',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  prestigeBannerPressed: { backgroundColor: '#f0a030' },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#f0d060', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: '#e0c080', textAlign: 'center' },
  prestigeBtn: {
    backgroundColor: '#352050',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f0d060',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  prestigeBtnPressed: { backgroundColor: '#f0d060' },
  prestigeBtnText: { fontSize: 16, fontWeight: '700', color: '#f0d060' },
  prestigeBtnTextPressed: { color: '#1a0a2e' },
});

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1a0a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#f0e8d8', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#b0a090', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#241445',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a2a5e',
    padding: 14,
    marginBottom: 10,
  },
  rowPressed: { backgroundColor: '#352050', borderColor: '#f0d060' },
  advName: { fontSize: 16, fontWeight: '600', color: '#f0e8d8' },
  advMeta: { fontSize: 13, color: '#b0a090', marginTop: 2 },
  tier: { fontSize: 22, fontWeight: '800', color: '#f0d060' },
  cancel: { marginTop: 12, alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontSize: 16, color: '#8a7a6a' },
});
