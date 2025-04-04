import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api/alerts': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            '/api': {
                target: 'https://www.nightjet.com/nj-booking-ocp',
                changeOrigin: true,
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        proxyReq.setHeader('Referer', 'https://www.nightjet.com/');
                        proxyReq.setHeader('Origin', 'https://www.nightjet.com');
                        proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
                    });
                },
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
}); 