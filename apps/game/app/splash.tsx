/**
 * Splash screen — shown on first launch.
 *
 * Displays the guild crest and title, then navigates to the start menu
 * after a brief delay. Uses expo-router for navigation.
 */

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

const SPLASH_DURATION_MS = 2200;

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/start');
    }, SPLASH_DURATION_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container} testID="splash-screen">
      <View style={styles.crest} testID="splash-crest">
        <Text style={styles.crestSymbol}>⚔</Text>
      </View>
      <Text style={styles.title} testID="splash-title">
        Retired Hero's Guild
      </Text>
      <Text style={styles.subtitle} testID="splash-subtitle">
        Build your legacy. Shape the world.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0818',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  crest: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#f0d060',
    backgroundColor: '#1a0f30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestSymbol: {
    fontSize: 56,
    color: '#f0d060',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f0e8d8',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#8a7a60',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
