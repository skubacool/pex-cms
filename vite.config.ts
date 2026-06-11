import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work at any URL (GitHub Pages project path, local file, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5174, strictPort: true },
});
