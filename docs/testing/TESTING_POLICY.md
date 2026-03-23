# Testing Policy — Retired Hero's Guild

Last updated: 2026-03-22

---

## Four-Layer Strategy

| Layer | What | Tool | Environment | When |
|---|---|---|---|---|
| 1 — Pure logic | Engine, systems, utils, store | Vitest | node | Every commit |
| 2 — Component | Screens, UI components | Vitest + RNTL | node + mocks | Every commit |
| 3 — Integration | Full tick pipe, dispatch | Vitest + fast-check | node | Every commit |
| 4 — E2E | Splash → start → game flow | Cypress | Expo Web | PRs to Dev |

CI gates every push with layers 1–3. Cypress (layer 4) runs only on PRs to Dev to avoid the cost of starting the Expo Web bundler per commit.

---

## Layer 1 — Pure Logic

**What:** Engine functions (`tick`, `dispatch`, `pipe`), all system processors, store logic, utility functions.

**Rule:** All logic under test must be a pure function — same input always produces same output, no side effects. If you are testing something that talks to the network, filesystem, or native bridge, it belongs in layer 2 or 4.

**Location:** `apps/game/src/**/__tests__/**/*.test.ts`

**Environment:** `environment: 'node'` in vitest.config.ts. No mocks of React Native or expo-router needed.

**Property tests:** Engine invariants (tick monotonicity, dispatch idempotency, etc.) use `fast-check` in `*.property.test.ts` files alongside unit tests.

**Pattern:**
```ts
import { describe, it, expect } from 'vitest';
import { processQuests } from '../processQuests';
import { createInitialGameState } from '../../stores/initialState';

it('completes a quest when ticksRemaining reaches 0', () => {
  const state = /* build minimal state */;
  const result = processQuests(state);
  expect(result.quests[questId]?.isComplete).toBe(true);
});
```

---

## Layer 2 — Component Tests

**What:** React Native screens and UI components. Tests that a screen renders its key elements, responds to store state, and calls navigation correctly.

**Rule:** No real expo-router, no real MMKV, no native bridge. Mock at the boundary. Use testIDs for all queries — never query by text content that may change.

**Location:** `apps/game/src/__tests__/screens/**/*.test.tsx` and `apps/game/src/__tests__/components/**/*.test.tsx`

**Environment:** Vitest node env + `@testing-library/react-native` + setup file at `src/__tests__/setup.rntl.ts` that mocks `expo-router`.

**testID convention:**
- Screens: `<screen-name>` (e.g. `splash-screen`, `start-menu`)
- Buttons: `btn-<action>` (e.g. `btn-start-game`, `btn-recruit`)
- Data display: `<domain>-<field>` (e.g. `stats-gold`, `visitor-name`)
- Lists: `<entity>-list`, `<entity>-item-<id>`

Every interactive element and every screen root must have a testID. Add testIDs alongside new components — never retroactively.

**Mocking expo-router:**
```ts
vi.mock('expo-router', () => ({
  router: { replace: vi.fn(), push: vi.fn(), back: vi.fn() },
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));
```

**Mocking the game store:**
```ts
import { useGameStore } from '../../stores/gameStore';
import { createInitialGameState } from '../../stores/initialState';

beforeEach(() => {
  useGameStore.setState({ state: createInitialGameState() });
});
```

**Pattern:**
```ts
import { render, screen, fireEvent } from '@testing-library/react-native';

it('shows Start Guild when no save exists', () => {
  render(<StartMenuScreen />);
  expect(screen.getByTestId('btn-start-game')).toBeTruthy();
  expect(screen.getByText('Start Guild')).toBeTruthy();
});
```

---

## Layer 3 — Integration Tests

**What:** Full tick pipeline end-to-end, dispatch sequences, multi-system interactions, property invariants over many ticks.

**Rule:** Still pure functions — no React, no native bridge. Input state in, output state out. Verify cross-system invariants: e.g. gold never goes negative from a single tick, event log grows monotonically.

**Location:** `apps/game/src/engine/__tests__/tick.integration.test.ts`, `tick.property.test.ts`

**Tool:** `fast-check` for property-based generation of arbitrary game states.

---

## Layer 4 — E2E (Cypress)

**What:** Real user flows against the Expo Web target. Splash → start menu → game dashboard. Verifies the full stack: bundler, navigation, store hydration, UI render.

**Location:** `e2e/cypress/e2e/**/*.cy.ts`

**When:** Only on PRs to Dev. Start Expo Web first: `npx expo start --web` (port 8081). Then `npm run test:e2e`.

**Rule:** Use `data-testid` selectors only. Never select by CSS class or DOM structure. Use `{ force: true }` on clicks — React Native Web uses `overflow: hidden` which prevents Cypress visibility checks on inner views. Use `.should('exist')` not `.should('be.visible')` for the same reason.

**Fake timers:** Use `cy.clock()` / `cy.tick(ms)` to control time-based navigation (e.g. splash timeout).

---

## TDD Rule

**Write the test before or alongside the implementation. Never after.**

Workflow:
1. Write a failing test that describes the intended behavior
2. Implement the minimum code to make it pass
3. Refactor if needed — keep tests green
4. Run the full suite before committing

PRs without tests for new logic will not be merged.

---

## What "Done" Means

A feature is done when:
- [ ] Failing test written first (or alongside)
- [ ] All new screens have testIDs on root + every interactive element
- [ ] Pure logic tests cover the happy path, edge cases, and any invariants
- [ ] Component tests cover render, store-driven state changes, and navigation
- [ ] `npm run lint && npm run typecheck && npm run test:unit` all pass
- [ ] PR description explains decisions, not generated code
