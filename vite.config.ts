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
    port: 2830,
    host: '0.0.0.0', // Allow external access
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:2829',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})
