/**
 * SplashScreen component tests.
 *
 * Verifies:
 * - All key elements render with correct testIDs
 * - Timer fires router.replace('/start') after SPLASH_DURATION_MS
 * - Cleanup cancels the timer (no state-update-on-unmounted warning)
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import SplashScreen from '../../../app/splash';

const SPLASH_DURATION_MS = 2200;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SplashScreen', () => {
  it('renders the splash container', () => {
    render(<SplashScreen />);
    expect(screen.getByTestId('splash-screen')).toBeTruthy();
  });

  it('renders the crest', () => {
    render(<SplashScreen />);
    expect(screen.getByTestId('splash-crest')).toBeTruthy();
  });

  it('renders the title', () => {
    render(<SplashScreen />);
    expect(screen.getByTestId('splash-title')).toBeTruthy();
    expect(screen.getByText("Retired Hero's Guild")).toBeTruthy();
  });

  it('renders the subtitle', () => {
    render(<SplashScreen />);
    expect(screen.getByTestId('splash-subtitle')).toBeTruthy();
    expect(screen.getByText('Build your legacy. Shape the world.')).toBeTruthy();
  });

  it('navigates to /start after the splash duration', () => {
    render(<SplashScreen />);
    expect(router.replace).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(SPLASH_DURATION_MS);
    });
    expect(router.replace).toHaveBeenCalledWith('/start');
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it('does not navigate before the splash duration elapses', () => {
    render(<SplashScreen />);
    act(() => {
      vi.advanceTimersByTime(SPLASH_DURATION_MS - 1);
    });
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('cancels the timer on unmount', () => {
    const { unmount } = render(<SplashScreen />);
    unmount();
    act(() => {
      vi.advanceTimersByTime(SPLASH_DURATION_MS);
    });
    expect(router.replace).not.toHaveBeenCalled();
  });
});
