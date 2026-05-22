import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useGameStore } from '../../src/stores/gameStore';
import { StatsBar } from '../../src/components/StatsBar';

export default function TabLayout() {
  const state = useGameStore((s) => s.state);

  return (
    <View style={styles.root}>
      <StatsBar
        currentYear={state.time.currentYear}
        gold={state.guild.gold}
        reputation={state.guild.reputation}
        adventurerCount={Object.keys(state.adventurers).length}
        currentDay={state.time.currentDay}
        currentSeason={state.time.currentSeason}
      />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#140a24',
            borderTopColor: '#3a2a5e',
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: '#f0d060',
          tabBarInactiveTintColor: '#4a3a5e',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          headerStyle: { backgroundColor: '#140a24' },
          headerTintColor: '#f0d060',
          headerTitleStyle: { color: '#f0e8d8', fontWeight: 'bold' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Guild' }} />
        <Tabs.Screen name="board" options={{ title: 'Board' }} />
        <Tabs.Screen name="roster" options={{ title: 'Roster' }} />
        <Tabs.Screen name="hall" options={{ title: 'Hall' }} />
        <Tabs.Screen name="dynasty" options={{ title: 'Dynasty' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#140a24',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
});
