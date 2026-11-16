import app from './app';
import { env } from './config/env';
import { closeAllTenantConnections } from './config/tenantDb';

const server = app.listen(env.PORT, () => {
  console.log(`[LedgerGuard Server] Mode: ${env.NODE_ENV}`);
  console.log(`[LedgerGuard Server] Gateway URL: http://localhost:${env.PORT}`);
  console.log(`[LedgerGuard Server] Health Check: http://localhost:${env.PORT}/api/v1/health`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`[LedgerGuard Server] ${signal} received. Closing tenant database connections...`);
  try {
    await closeAllTenantConnections();
    console.log('[LedgerGuard Server] All tenant database connections closed cleanly.');
  } catch (err) {
    console.error('[LedgerGuard Server] Error closing tenant database connections:', err);
  }

  server.close(() => {
    console.log('[LedgerGuard Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
