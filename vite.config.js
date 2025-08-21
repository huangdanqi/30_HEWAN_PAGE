import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
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
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://121.43.196.106:2829',
                changeOrigin: true,
                rewrite: function (path) { return path; }, // Don't remove /api prefix
            },
        },
    },
});
