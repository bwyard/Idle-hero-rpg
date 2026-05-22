/**
 * StartMenuScreen component tests.
 *
 * Verifies:
 * - Key elements render with correct testIDs
 * - Shows "Start Guild" when no save (ticksElapsed === 0)
 * - Shows "Continue" + "New Game" when save exists (ticksElapsed > 0)
 * - "Start Guild" / "New Game" dispatch GENERATE_QUESTS and navigate to /(tabs)
 * - "Continue" navigates without resetting state
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';
import StartMenuScreen from '../../../app/start';

const freshState = () => createInitialGameState();
const savedState = () => ({
  ...createInitialGameState(),
  time: { ...createInitialGameState().time, ticksElapsed: 100 },
});

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({ state: freshState() });
});

// ─── No save ──────────────────────────────────────────────────────────────────

describe('StartMenuScreen — no save (ticksElapsed === 0)', () => {
  it('renders the start menu', () => {
    render(<StartMenuScreen />);
    expect(screen.getByTestId('start-menu')).toBeTruthy();
  });

  it('renders the title', () => {
    render(<StartMenuScreen />);
    expect(screen.getByTestId('start-menu-title')).toBeTruthy();
    expect(screen.getByText("Retired Hero's Guild")).toBeTruthy();
  });

  it('shows "Start Guild" and no other buttons', () => {
    render(<StartMenuScreen />);
    expect(screen.getByTestId('btn-start-game')).toBeTruthy();
    expect(screen.getByText('Start Guild')).toBeTruthy();
    expect(screen.queryByTestId('btn-continue')).toBeNull();
    expect(screen.queryByTestId('btn-new-game')).toBeNull();
  });

  it('navigates to /(tabs) on Start Guild', () => {
    render(<StartMenuScreen />);
    fireEvent.press(screen.getByTestId('btn-start-game'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it('dispatches GENERATE_QUESTS on Start Guild', () => {
    render(<StartMenuScreen />);
    fireEvent.press(screen.getByTestId('btn-start-game'));
    const quests = Object.values(useGameStore.getState().state.quests);
    expect(quests.length).toBeGreaterThan(0);
  });
});

// ─── Has save ─────────────────────────────────────────────────────────────────

describe('StartMenuScreen — has save (ticksElapsed > 0)', () => {
  beforeEach(() => {
    useGameStore.setState({ state: savedState() });
  });

  it('shows Continue and New Game buttons', () => {
    render(<StartMenuScreen />);
    expect(screen.getByTestId('btn-continue')).toBeTruthy();
    expect(screen.getByTestId('btn-new-game')).toBeTruthy();
    expect(screen.queryByTestId('btn-start-game')).toBeNull();
  });

  it('Continue navigates to /(tabs) without resetting state', () => {
    render(<StartMenuScreen />);
    fireEvent.press(screen.getByTestId('btn-continue'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    expect(useGameStore.getState().state.time.ticksElapsed).toBe(100);
  });

  it('New Game resets state and navigates to /(tabs)', () => {
    render(<StartMenuScreen />);
    fireEvent.press(screen.getByTestId('btn-new-game'));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    expect(useGameStore.getState().state.time.ticksElapsed).toBe(0);
  });

  it('New Game dispatches GENERATE_QUESTS after reset', () => {
    render(<StartMenuScreen />);
    fireEvent.press(screen.getByTestId('btn-new-game'));
    const quests = Object.values(useGameStore.getState().state.quests);
    expect(quests.length).toBeGreaterThan(0);
  });
});
