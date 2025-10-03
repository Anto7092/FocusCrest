import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    proxy: {
      // This proxy configuration is essential for local development.
      // It forwards any requests from the frontend to a path starting with `/api`
      // to the Vercel development server (typically running on http://localhost:3000).
      // This allows the React app (served by Vite) to communicate with the
      // serverless functions located in the `/api` directory.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});