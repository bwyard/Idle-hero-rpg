/**
 * Root index route tests.
 *
 * Verifies that mounting the root index immediately redirects to /splash,
 * which is the entry point of the splash → start menu flow.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react-native';
import { router } from 'expo-router';
import IndexRoute from '../../../app/index';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Root index route', () => {
  it('redirects to /splash on mount', () => {
    render(<IndexRoute />);
    expect(router.replace).toHaveBeenCalledWith('/splash');
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it('renders nothing visible', () => {
    const { toJSON } = render(<IndexRoute />);
    expect(toJSON()).toBeNull();
  });
});
