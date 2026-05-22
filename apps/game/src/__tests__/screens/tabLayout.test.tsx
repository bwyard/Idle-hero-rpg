import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';
import TabLayout from '../../../app/(tabs)/_layout';

vi.mock('expo-router', () => {
  const Tabs = Object.assign(({ children }: { children: React.ReactNode }) => children, {
    Screen: () => null,
  });
  return {
    Tabs,
    router: { replace: vi.fn(), push: vi.fn(), back: vi.fn() },
    useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({ state: createInitialGameState() });
});

describe('TabLayout', () => {
  it('renders the persistent stats bar', () => {
    render(<TabLayout />);
    expect(screen.getByTestId('stats-bar')).toBeTruthy();
  });

  it('reflects gold from game state in stats bar', () => {
    useGameStore.setState({
      state: {
        ...createInitialGameState(),
        guild: { ...createInitialGameState().guild, gold: 999 },
      },
    });
    render(<TabLayout />);
    expect(screen.getByTestId('stats-gold').props.children).toBe('999');
  });
});
