import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// `base` matters for GitHub Pages project sites served from /<repo>/.
// The deploy workflow sets VITE_BASE=/<repo>/. Defaults to '/' for local dev,
// user/org pages (<user>.github.io) and custom domains.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [svelte()],
  server: { host: true, port: 5174 },
});
