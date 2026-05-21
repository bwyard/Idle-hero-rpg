import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
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
  );
}
