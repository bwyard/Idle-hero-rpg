import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';
import RosterScreen from '../../../app/(tabs)/roster';

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({ state: createInitialGameState() });
});

describe('RosterScreen', () => {
  it('renders without crashing', () => {
    render(<RosterScreen />);
    expect(screen.getByTestId('roster-screen')).toBeTruthy();
  });

  it('shows the adventurer roster', () => {
    render(<RosterScreen />);
    expect(screen.getByTestId('adventurer-roster')).toBeTruthy();
  });
});
