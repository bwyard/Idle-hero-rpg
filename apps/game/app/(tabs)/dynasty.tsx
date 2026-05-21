import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../src/stores/gameStore';

export default function DynastyScreen() {
  const state = useGameStore((s) => s.state);

  return (
    <View style={styles.root} testID="dynasty-screen">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hall of Heroes</Text>
          <Text style={styles.placeholder}>Unlocks after first prestige</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#140a24',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
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
  statLabel: {
    fontSize: 15,
    color: '#d0c0a0',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f0d060',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
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
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0d060',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#b0a090',
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 14,
    color: '#8a7a6a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
