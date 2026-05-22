import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useGameStore } from '../src/stores/gameStore';
import { getPlatformStorage } from '../src/stores/platformStorage';

LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

/** Autosave interval in milliseconds. */
const AUTOSAVE_INTERVAL_MS = 30_000;

export default function RootLayout() {
  useEffect(() => {
    const storage = getPlatformStorage();
    useGameStore.getState().initFromStorage(storage);

    const autosave = setInterval(() => {
      useGameStore.getState().saveToStorage(storage);
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      clearInterval(autosave);
    };
  }, []);

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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="start" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="adventurer/[id]" options={{ title: 'Adventurer Detail' }} />
        <Stack.Screen name="visitor-queue" options={{ title: 'Visitor Queue' }} />
      </Stack>
    </ErrorBoundary>
  );
}
