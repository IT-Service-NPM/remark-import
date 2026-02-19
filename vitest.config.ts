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
      enabled: true,
      provider: 'istanbul',
      reporter: ['text', 'json-summary', 'json', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      // include: [
      //   './src/**/*.ts'
      // ],
      exclude: [
        './test'
      ],
      excludeAfterRemap: true
    },
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'junit', 'json']
      : ['default'],
    outputFile: {
      junit: './test/results/junit-report.xml',
      json: './test/results/json-report.json',
    },
    setupFiles: [
      '@altano/vitest-plugins/matchers'
    ],
  },
});
