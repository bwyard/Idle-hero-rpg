import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a0a2e' },
        headerTintColor: '#c9b14a',
      }}
    />
  );
}
