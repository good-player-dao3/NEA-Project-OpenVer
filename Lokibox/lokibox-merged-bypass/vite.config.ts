import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey from 'vite-plugin-monkey';
import path from 'path';
import { fileURLToPath } from 'url';
import { obfuscatorPlugin } from './vite-obfuscator.js';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['lucide-svelte'],
  },
  plugins: [
    svelte(),
    obfuscatorPlugin(),
    monkey({
      entry: 'src/boot.ts',
      userscript: {
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXBhY2thZ2Utb3Blbi1pY29uIGx1Y2lkZS1wYWNrYWdlLW9wZW4iPjxwYXRoIGQ9Ik0xMiAyMnYtOSIvPjxwYXRoIGQ9Ik0xNS4xNyAyLjIxYTEuNjcgMS42NyAwIDAgMSAxLjYzIDBMMjEgNC41N2ExLjkzIDEuOTMgMCAwIDEgMCAzLjM2TDguODIgMTQuNzlhMS42NTUgMS42NTUgMCAwIDEtMS42NCAwTDMgMTIuNDNhMS45MyAxLjkzIDAgMCAxIDAtMy4zNnoiLz48cGF0aCBkPSJNMjAgMTN2My44N2EyLjA2IDIuMDYgMCAwIDEtMS4xMSAxLjgzbC02IDMuMDhhMS45MyAxLjkzIDAgMCAxLTEuNzggMGwtNi0zLjA4QTIuMDYgMi4wNiAwIDAgMSA0IDE2Ljg3VjEzIi8+PHBhdGggZD0iTTIxIDEyLjQzYTEuOTMgMS45MyAwIDAgMCAwLTMuMzZMOC44MyAyLjJhMS42NCAxLjY0IDAgMCAwLTEuNjMgMEwzIDQuNTdhMS45MyAxLjkzIDAgMCAwIDAgMy4zNmwxMi4xOCA2Ljg2YTEuNjM2IDEuNjM2IDAgMCAwIDEuNjMgMHoiLz48L3N2Zz4=',
        namespace: 'lokibox',
        name: 'LokiBox',
        author: 'Loki Hackers',
        description: 'A cheating plugin for Box3',
        match: ['https://view.dao3.fun/*', 'https://dao3.fun/*'],
      },
    }),
  ],
  resolve: {
    alias: {
      src: path.resolve(fileURLToPath(new URL('./src', import.meta.url))),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_debugger: true,
        passes: 2,
        unused: true,
        dead_code: true,
      },
      mangle: false,
      output: {
        comments: false,
        beautify: false,
      },
    },
  },
});
