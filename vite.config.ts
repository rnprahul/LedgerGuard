import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (res && !('headersSent' in res && res.headersSent)) {
              (res as any).writeHead(503, {
                'Content-Type': 'application/json',
              });
              (res as any).end(
                JSON.stringify({
                  success: false,
                  message: `Backend service unavailable at http://127.0.0.1:5000 (${err.message}). Ensure the LedgerGuard backend server is running.`,
                  code: 'SERVICE_UNAVAILABLE',
                })
              );
            }
          });
        },
      },
    },
  },
});
