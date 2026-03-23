/**
 * Root vitest config — only used when running `npx vitest` from the repo root.
 *
 * Each package (apps/game, packages/mcp) has its own vitest.config.ts with
 * package-specific aliases and setup. Running from root without a workspace
 * config picks up ALL test files but lacks those per-package settings.
 *
 * This config excludes packages that need their own setup so root runs don't
 * produce false failures. Use `npm run test:unit` (turbo) for full suite runs.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      // Game tests require react-native alias + Module._load patch from
      // apps/game/vitest.config.ts — run via turbo or cd apps/game.
      'apps/game/**',
      // Agent worktrees are temporary workspaces, not real test targets.
      '.claude/**',
      '**/node_modules/**',
      '**/dist/**',
    ],
  },
});
