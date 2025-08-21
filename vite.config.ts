import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Always use root path for cloud deployment
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
    host: '0.0.0.0', // Bind to all network interfaces
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