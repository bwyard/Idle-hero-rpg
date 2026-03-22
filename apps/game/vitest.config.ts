import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/__tests__/**', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@idle-hero-rpg/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@prime/prime-random': path.resolve(
        __dirname,
        '../../../prime/packages/prime-random/src/index.ts',
      ),
      '@stage/stage-economy': path.resolve(
        __dirname,
        '../../../stage/packages/stage-economy/src/index.ts',
      ),
      '@stage/stage-time': path.resolve(
        __dirname,
        '../../../stage/packages/stage-time/src/index.ts',
      ),
    },
  },
});
