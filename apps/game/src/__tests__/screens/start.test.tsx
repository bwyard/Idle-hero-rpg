/**
 * StartMenuScreen component tests.
 *
 * Verifies:
 * - Key elements render with correct testIDs
 * - Shows "Start Guild" when no save (empty adventurers)
 * - Shows "Continue" when save exists (adventurers present)
 * - Pressing the button calls router.replace('/')
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';
import StartMenuScreen from '../../../app/start';

beforeEach(() => {
  vi.clearAllMocks();
  // createInitialGameState includes starter adventurers; clear them for the
  // "no save" baseline so tests can control presence of adventurers explicitly.
  const state = createInitialGameState();
  useGameStore.setState({ state: { ...state, adventurers: {} } });
});

describe('StartMenuScreen — no save', () => {
  it('renders the start menu', () => {
    render(<StartMenuScreen />);
    expect(screen.getByTestId('start-menu')).toBeTruthy();
  });

  it('renders the title', () => {
    render(<StartMenuScreen />);
    expect(screen.getByTestId('start-menu-title')).toBeTruthy();
    expect(screen.getByText("Retired Hero's Guild")).toBeTruthy();
  });

  it('shows "Start Guild" when no adventurers exist', () => {
    render(<StartMenuScreen />);
    expect(screen.getByTestId('btn-start-game')).toBeTruthy();
    expect(screen.getByText('Start Guild')).toBeTruthy();
  });

  it('navigates to the game on press', () => {
    render(<StartMenuScreen />);
    fireEvent.press(screen.getByTestId('btn-start-game'));
    expect(router.replace).toHaveBeenCalledWith('/');
    expect(router.replace).toHaveBeenCalledTimes(1);
  });
});

describe('StartMenuScreen — with save', () => {
  beforeEach(() => {
    const state = createInitialGameState();
    // Inject a minimal adventurer to simulate an existing save
    useGameStore.setState({
      state: {
        ...state,
        adventurers: {
          'adv-001': {
            id: 'adv-001',
            name: 'Aria',
            tier: 'F',
            archetype: null,
            xp: 0,
            milestones: [],
            skillBorrowUsed: false,
            recruitedYear: 0,
            retiredYear: null,
          },
        },
      },
    });
  });

  it('shows "Continue" when adventurers exist', () => {
    render(<StartMenuScreen />);
    expect(screen.getByText('Continue')).toBeTruthy();
  });
});
