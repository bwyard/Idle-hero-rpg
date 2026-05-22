/**
 * Start menu — main menu screen shown after the splash.
 *
 * Entry points:
 *   - No save:   "Start Guild" → generates initial quests, navigates to game
 *   - Has save:  "Continue"    → navigates to game with existing save
 *                "New Game"    → resets save, generates quests, navigates to game
 *
 * hasSave is derived from ticksElapsed > 0 — starter adventurers are always
 * present in initialState, so adventurer count would always appear as "has save".
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../src/stores/gameStore';
import { getPlatformStorage } from '../src/stores/platformStorage';

export default function StartMenuScreen() {
  const hasSave = useGameStore((s) => s.state.time.ticksElapsed > 0);
  const dispatch = useGameStore((s) => s.dispatch);
  const resetGame = useGameStore((s) => s.resetGame);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  const handleNewGame = () => {
    resetGame(getPlatformStorage());
    dispatch({ type: 'GENERATE_QUESTS' });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container} testID="start-menu">
      <View style={styles.header}>
        <Text style={styles.title} testID="start-menu-title">
          Retired Hero's Guild
        </Text>
        <Text style={styles.tagline}>Your dynasty begins here.</Text>
      </View>

      <View style={styles.buttons}>
        {hasSave ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleContinue}
              testID="btn-continue"
            >
              <Text style={styles.buttonTextPrimary}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleNewGame}
              testID="btn-new-game"
            >
              <Text style={styles.buttonTextSecondary}>New Game</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleNewGame}
            testID="btn-start-game"
          >
            <Text style={styles.buttonTextPrimary}>Start Guild</Text>
          </TouchableOpacity>
        )}
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
