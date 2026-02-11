import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: [
    'src/index.ts'
  ],
  format: ['cjs', 'esm'],
  bundle: true,
  treeshake: true,
  splitting: false,
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true
});
