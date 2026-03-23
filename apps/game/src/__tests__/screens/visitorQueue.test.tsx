/**
 * visitorQueue.test.tsx — Component tests for the Visitor Queue screen.
 *
 * Tests the screen's rendering and dispatch behaviour using a mocked game store.
 * Pattern: mock useGameStore, render the screen, assert via testIDs.
 *
 * vi.mock calls are hoisted by vitest to the top of the module at compile time,
 * so placing them after imports is safe and satisfies the import/first ESLint rule.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import type { TransientVisitor } from '@idle-hero-rpg/shared';
import VisitorQueueScreen from '../../../app/visitor-queue';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('expo-router', () => ({
  router: { push: vi.fn(), replace: vi.fn() },
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockDispatch = vi.fn();

interface MockStoreSlice {
  state: {
    transientVisitors: Record<string, TransientVisitor>;
    time: { ticksElapsed: number };
  };
  dispatch: typeof mockDispatch;
}

const mockStore: MockStoreSlice = {
  state: {
    transientVisitors: {},
    time: { ticksElapsed: 0 },
  },
  dispatch: mockDispatch,
};

vi.mock('../../stores/gameStore', () => ({
  useGameStore: (selector: (s: MockStoreSlice) => unknown) => selector(mockStore),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeVisitor(overrides: Partial<TransientVisitor> = {}): TransientVisitor {
  return {
    id: 'vis_test1',
    name: 'Test Visitor',
    tier: 'D',
    archetype: 'Rogue',
    serviceRequest: 'Quest',
    serviceFee: 25,
    arrivedAtTick: 0,
    expiresAtTick: 100,
    heldUntilTick: null,
    holdCount: 0,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('VisitorQueueScreen', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockStore.state = {
      transientVisitors: {},
      time: { ticksElapsed: 0 },
    };
  });

  it('renders the visitor queue container', () => {
    const { getByTestId } = render(<VisitorQueueScreen />);
    expect(getByTestId('visitor-queue')).toBeTruthy();
  });

  it('renders empty state message when no visitors are present', () => {
    mockStore.state.transientVisitors = {};

    const { getByTestId } = render(<VisitorQueueScreen />);
    expect(getByTestId('visitor-queue-empty')).toBeTruthy();
  });

  it('does not show the empty state when visitors are present', () => {
    const visitor = makeVisitor({ id: 'vis_abc123' });
    mockStore.state.transientVisitors = { vis_abc123: visitor };

    const { queryByTestId } = render(<VisitorQueueScreen />);
    expect(queryByTestId('visitor-queue-empty')).toBeNull();
  });

  it('renders a visitor card for each visitor in the store', () => {
    const visitor = makeVisitor({ id: 'vis_abc123' });
    mockStore.state.transientVisitors = { vis_abc123: visitor };

    const { getByTestId } = render(<VisitorQueueScreen />);
    expect(getByTestId('visitor-card-vis_abc123')).toBeTruthy();
  });

  it('renders approve and deny buttons for each visitor', () => {
    const visitor = makeVisitor({ id: 'vis_abc123' });
    mockStore.state.transientVisitors = { vis_abc123: visitor };

    const { getByTestId } = render(<VisitorQueueScreen />);
    expect(getByTestId('btn-approve-vis_abc123')).toBeTruthy();
    expect(getByTestId('btn-deny-vis_abc123')).toBeTruthy();
  });

  it('approve button dispatches APPROVE_VISITOR with correct visitorId', () => {
    const visitor = makeVisitor({ id: 'vis_abc123' });
    mockStore.state.transientVisitors = { vis_abc123: visitor };

    const { getByTestId } = render(<VisitorQueueScreen />);
    fireEvent.press(getByTestId('btn-approve-vis_abc123'));

    expect(mockDispatch).toHaveBeenCalledOnce();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'APPROVE_VISITOR',
      visitorId: 'vis_abc123',
    });
  });

  it('deny button dispatches DENY_VISITOR with correct visitorId', () => {
    const visitor = makeVisitor({ id: 'vis_abc123' });
    mockStore.state.transientVisitors = { vis_abc123: visitor };

    const { getByTestId } = render(<VisitorQueueScreen />);
    fireEvent.press(getByTestId('btn-deny-vis_abc123'));

    expect(mockDispatch).toHaveBeenCalledOnce();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'DENY_VISITOR',
      visitorId: 'vis_abc123',
    });
  });

  it('renders multiple visitor cards when multiple visitors are present', () => {
    const v1 = makeVisitor({ id: 'vis_111' });
    const v2 = makeVisitor({ id: 'vis_222', name: 'Second Visitor', tier: 'C' });
    mockStore.state.transientVisitors = { vis_111: v1, vis_222: v2 };

    const { getByTestId } = render(<VisitorQueueScreen />);
    expect(getByTestId('visitor-card-vis_111')).toBeTruthy();
    expect(getByTestId('visitor-card-vis_222')).toBeTruthy();
  });
});
