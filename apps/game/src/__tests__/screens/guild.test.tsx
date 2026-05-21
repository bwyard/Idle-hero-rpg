import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';
import GuildScreen from '../../../app/(tabs)/index';

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({ state: createInitialGameState() });
});

describe('GuildScreen', () => {
  it('renders without crashing', () => {
    render(<GuildScreen />);
    expect(screen.getByTestId('guild-screen')).toBeTruthy();
  });

  it('shows the guild header', () => {
    render(<GuildScreen />);
    expect(screen.getByTestId('guild-header')).toBeTruthy();
  });

  it('shows the stats bar', () => {
    render(<GuildScreen />);
    expect(screen.getByTestId('stats-bar')).toBeTruthy();
  });

  it('shows the hero card', () => {
    render(<GuildScreen />);
    expect(screen.getByTestId('hero-card')).toBeTruthy();
  });

  it('shows the event log', () => {
    render(<GuildScreen />);
    expect(screen.getByTestId('event-log')).toBeTruthy();
  });
});
