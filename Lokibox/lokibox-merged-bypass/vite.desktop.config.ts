import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
  optimizeDeps: {
    include: ['lucide-svelte'],
  },
  plugins: [svelte()],
  define: {
    'import.meta.env.VITE_LOKIBOX_DISABLE_TIME_MOCK': JSON.stringify('true'),
  },
  resolve: {
    alias: {
      src: path.resolve(fileURLToPath(new URL('./src', import.meta.url))),
      '$': path.resolve(fileURLToPath(new URL('./src/desktop/runtime.ts', import.meta.url))),
    },
  },
  build: {
    outDir: 'dist-desktop',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/boot.ts',
      name: 'LokiBox',
      formats: ['iife'],
      fileName: 'lokibox',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
