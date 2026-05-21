import { ScrollView, StyleSheet, View } from 'react-native';
import { useGameStore } from '../../src/stores/gameStore';
import { AdventurerRoster } from '../../src/components/AdventurerRoster';

export default function RosterScreen() {
  const adventurers = useGameStore((s) => Object.values(s.state.adventurers));

  return (
    <View style={styles.root} testID="roster-screen">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AdventurerRoster adventurers={adventurers} />
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
});
