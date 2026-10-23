import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
      },
      prerender: {
        entries: [
          '*',
          '/',
          '/notice',
          '/notice/interaction',
          '/notice/reply',
          '/oauth',
          '/oauth/callback',
          '/register',
          '/settings/auth',
        ],
      },
      adapter: adapter(),
      serviceWorker: {
        register: false,
      },
    }),
  ],
  build: {
    minify: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 20 * 1024, // 20KB
      }
    }
  },
  server: {
    cors: {
      origin: '*',
    },
  },
});
