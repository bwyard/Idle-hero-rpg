import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack
        initialRouteName="splash"
        screenOptions={{
          headerStyle: { backgroundColor: '#140a24' },
          headerTintColor: '#f0d060',
          headerTitleStyle: { color: '#f0e8d8' },
          title: "Retired Hero's Guild",
        }}
      >
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="start" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="adventurer/[id]" options={{ title: 'Adventurer Detail' }} />
        <Stack.Screen name="visitor-queue" options={{ title: 'Visitor Queue' }} />
      </Stack>
    </ErrorBoundary>
  );
}
