import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this repository below /RESHAPE/.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/RESHAPE/' : '/',
});
