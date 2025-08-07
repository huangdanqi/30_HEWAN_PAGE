import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/30_HEWAN_PAGE/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'docs'
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '2830'),
    host: '0.0.0.0', // Explicitly bind to all interfaces
    strictPort: true, // Fail if port is already in use
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:2829', // Use environment variable or fallback to localhost
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})
