import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    root: 'src/webapp',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src/webapp'),
            '@shared': path.resolve(__dirname, './src/shared'),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/alerts': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            '/api': {
                target: 'https://www.nightjet.com/nj-booking-ocp',
                changeOrigin: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        }
    },
    build: {
        outDir: '../../dist',
        emptyOutDir: true,
    }
}); 