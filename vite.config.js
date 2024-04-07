import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps for production builds
  },
  server: {
    port: 3000,
  },
});
