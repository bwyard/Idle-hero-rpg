import { Stack } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#140a24' },
        headerTintColor: '#f0d060',
        headerTitleStyle: { color: '#f0e8d8' },
        title: "Retired Hero's Guild",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Retired Hero's Guild" }} />
      <Stack.Screen name="adventurer/[id]" options={{ title: 'Adventurer Detail' }} />
    </Stack>
  );
}
