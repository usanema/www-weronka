// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://weronikanowik.pl',
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  },

  output: 'server',
  adapter: vercel()
});