import app from './app';
import { env } from './config/env';
import { closeAllTenantConnections } from './config/tenantDb';
import { connectRedis, disconnectRedis } from './config/redis';

const server = app.listen(env.PORT, async () => {
  console.log(`[LedgerGuard Server] Mode: ${env.NODE_ENV}`);
  console.log(`[LedgerGuard Server] Gateway URL: http://localhost:${env.PORT}`);
  console.log(`[LedgerGuard Server] Health Check: http://localhost:${env.PORT}/api/v1/health`);

  // Initialize Redis distributed lock engine (with non-blocking fallback)
  await connectRedis();
});

const gracefulShutdown = async (signal: string) => {
  console.log(`[LedgerGuard Server] ${signal} received. Closing connections...`);
  try {
    await closeAllTenantConnections();
    console.log('[LedgerGuard Server] All tenant database connections closed cleanly.');
  } catch (err) {
    console.error('[LedgerGuard Server] Error closing tenant database connections:', err);
  }

  try {
    await disconnectRedis();
    console.log('[LedgerGuard Server] Redis connection closed.');
  } catch (err) {
    console.error('[LedgerGuard Server] Error disconnecting Redis:', err);
  }

  server.close(() => {
    console.log('[LedgerGuard Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
