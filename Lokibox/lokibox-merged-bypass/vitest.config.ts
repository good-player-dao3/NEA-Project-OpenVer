import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(fileURLToPath(new URL('./src', import.meta.url))),
      // $ is vite-plugin-monkey's virtual module — stub it for tests
      $: path.resolve(
        fileURLToPath(new URL('./src/__mocks__/dollar.ts', import.meta.url)),
      ),
    },
  },
  test: {
    // stub browser globals not available in Node
    setupFiles: [
      path.resolve(
        fileURLToPath(new URL('./src/__mocks__/setup.ts', import.meta.url)),
      ),
    ],
  },
});
