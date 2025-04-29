import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, '.') },
      { find: '@/lib', replacement: path.resolve(__dirname, './@/lib') },
      { find: '@/components', replacement: path.resolve(__dirname, './@/components') }
    ]
  },
  optimizeDeps: {
    include: ['@mui/material', '@emotion/react', '@emotion/styled', 'xlsx']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
