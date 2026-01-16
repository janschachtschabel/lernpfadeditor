import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://redaktion.openeduhub.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core app chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-editor': ['@monaco-editor/react', 'monaco-editor'],
          'vendor-flow': ['reactflow', 'dagre'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable', 'html2canvas'],
          'vendor-ai': ['openai'],
          'vendor-utils': ['axios', 'zod', 'zustand']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
});