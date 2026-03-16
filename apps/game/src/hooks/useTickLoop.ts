/**
 * useTickLoop — Custom hook for managing the game tick interval.
 *
 * Starts/stops a setInterval that calls tick() at TICK_INTERVAL_MS.
 * Uses getState() to avoid stale closures — tick is called outside
 * the React render cycle.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TICK_INTERVAL_MS } from '../data/balance';
import { useGameStore } from '../stores/gameStore';

interface UseTickLoopReturn {
  /** Whether the tick loop is currently running. */
  isRunning: boolean;
  /** Start the auto-tick loop. */
  start: () => void;
  /** Stop the auto-tick loop. */
  stop: () => void;
  /** Toggle between running and stopped. */
  togglePlayPause: () => void;
  /** Advance the game by exactly one tick (manual). */
  tickOnce: () => void;
}

export function useTickLoop(): UseTickLoopReturn {
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(() => {
      useGameStore.getState().tick();
    }, TICK_INTERVAL_MS);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (intervalRef.current !== null) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const tickOnce = useCallback(() => {
    useGameStore.getState().tick();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { isRunning, start, stop, togglePlayPause, tickOnce };
}
