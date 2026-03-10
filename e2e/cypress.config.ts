import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Targets the Expo Web build — for E2E only (not the production target)
    baseUrl: 'http://localhost:8081',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
  },
});
