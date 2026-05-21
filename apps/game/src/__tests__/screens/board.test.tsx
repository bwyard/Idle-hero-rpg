import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';
import BoardScreen from '../../../app/(tabs)/board';

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({ state: createInitialGameState() });
});

describe('BoardScreen', () => {
  it('renders without crashing', () => {
    render(<BoardScreen />);
    expect(screen.getByTestId('board-screen')).toBeTruthy();
  });

  it('shows the quest board', () => {
    render(<BoardScreen />);
    expect(screen.getByTestId('quest-board')).toBeTruthy();
  });
});
