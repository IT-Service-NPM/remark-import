import { defineConfig } from 'vitest/config';
import { vitestTypescriptAssertPlugin }
  from 'vite-plugin-vitest-typescript-assert';

export default defineConfig({
  plugins: [
    vitestTypescriptAssertPlugin()
  ],
  test: {
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json-summary', 'json', 'lcov'],
      reportOnFailure: true,
      include: ['src/**']
    },
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'junit', 'json']
      : ['default'],
    outputFile: {
      junit: 'test/results/junit-report.xml',
      json: 'test/results/json-report.json',
    },
    setupFiles: [
      '@altano/vitest-plugins/matchers'
    ],
  },
});
