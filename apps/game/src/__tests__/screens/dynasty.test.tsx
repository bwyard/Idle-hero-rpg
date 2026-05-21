import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';
import DynastyScreen from '../../../app/(tabs)/dynasty';

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({ state: createInitialGameState() });
});

describe('DynastyScreen', () => {
  it('renders without crashing', () => {
    render(<DynastyScreen />);
    expect(screen.getByTestId('dynasty-screen')).toBeTruthy();
  });

  it('shows the dynasty info section', () => {
    render(<DynastyScreen />);
    expect(screen.getByTestId('dynasty-info')).toBeTruthy();
  });
});
