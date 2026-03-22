/**
 * Start menu — main menu screen shown after the splash.
 *
 * Entry points:
 *   - New Game → clears save and navigates to the game
 *   - Continue → navigates to the game with existing save (if any)
 *
 * Future: Settings, Credits, Hall of Heroes.
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../src/stores/gameStore';

export default function StartMenuScreen() {
  // hasSave: true if the player has adventurers from a previous session
  const hasSave = useGameStore((s) => Object.keys(s.state.adventurers).length > 0);

  function handleStartGame() {
    router.replace('/');
  }

  return (
    <View style={styles.container} testID="start-menu">
      <View style={styles.header}>
        <Text style={styles.title} testID="start-menu-title">
          Retired Hero's Guild
        </Text>
        <Text style={styles.tagline}>Your dynasty begins here.</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleStartGame}
          testID="btn-start-game"
        >
          <Text style={styles.buttonTextPrimary}>{hasSave ? 'Continue' : 'Start Guild'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>v0.1 — Early Development</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0818',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f0d060',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: '#8a7a60',
    fontStyle: 'italic',
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#f0d060',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f0d060',
  },
  buttonTextPrimary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d0818',
  },
  buttonTextSecondary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f0d060',
  },
  version: {
    fontSize: 11,
    color: '#3a2f50',
  },
});
