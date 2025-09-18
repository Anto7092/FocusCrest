import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The faulty proxy configuration has been completely removed.
  // Vercel's dev server handles API routing automatically,
  // and the proxy was the root cause of the infinite loading hangs.
});
