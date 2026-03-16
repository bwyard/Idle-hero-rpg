import { Stack } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['props.pointerEvents is deprecated']);

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#140a24' },
        headerTintColor: '#f0d060',
        title: "Retired Hero's Guild",
      }}
    />
  );
}
