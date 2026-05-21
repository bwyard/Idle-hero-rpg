import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';
import HallScreen from '../../../app/(tabs)/hall';

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({ state: createInitialGameState() });
});

describe('HallScreen', () => {
  it('renders without crashing', () => {
    render(<HallScreen />);
    expect(screen.getByTestId('hall-screen')).toBeTruthy();
  });

  it('shows the buildings section', () => {
    render(<HallScreen />);
    expect(screen.getByTestId('buildings-section')).toBeTruthy();
  });
});
