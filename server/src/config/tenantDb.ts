import mongoose, { Connection } from 'mongoose';
import { env } from './env';
import { registerTenantModels, TenantModels } from '../models/tenantModels';
import { AppError } from '../middleware/errorHandler';

interface CachedTenantDb {
  connection: Connection;
  models: TenantModels;
  lastAccessed: number;
}

const SAFE_TENANT_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

// In-memory connection pool cache mapping tenantId -> connection & models
const tenantConnectionPool = new Map<string, CachedTenantDb>();

export interface TenantDatabaseResult {
  connection: Connection;
  models: TenantModels;
  dbName: string;
}

/**
 * Resolves or dynamically provisions an isolated Mongoose connection and
 * compiled models for the specified tenant identifier.
 */
export const getTenantDatabase = async (tenantId: string): Promise<TenantDatabaseResult> => {
  if (!tenantId || typeof tenantId !== 'string' || !SAFE_TENANT_ID_REGEX.test(tenantId)) {
    throw new AppError(
      'Invalid or unsafe tenant identifier provided for database resolution',
      403,
      'INVALID_TENANT_ID'
    );
  }

  const dbName = `ledgerguard_${tenantId}`;

  // Check active cached connection
  const cached = tenantConnectionPool.get(tenantId);
  if (cached && cached.connection.readyState === 1) {
    cached.lastAccessed = Date.now();
    return {
      connection: cached.connection,
      models: cached.models,
      dbName,
    };
  }

  // If connection exists but disconnected/closed, clean it up
  if (cached) {
    tenantConnectionPool.delete(tenantId);
    try {
      await cached.connection.close();
    } catch {
      // Ignore cleanup error on stale connection
    }
  }

  try {
    // Open dedicated connection to the isolated database
    const connection = await mongoose
      .createConnection(env.MONGO_BASE_URI, {
        dbName,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .asPromise();

    // Dynamically compile tenant schemas scoped to this database connection
    const models = registerTenantModels(connection);

    // Attach disconnection monitor
    connection.on('disconnected', () => {
      tenantConnectionPool.delete(tenantId);
    });

    connection.on('error', (err) => {
      console.error(`[Mongoose Tenant DB Error] ${dbName}:`, err.message);
    });

    tenantConnectionPool.set(tenantId, {
      connection,
      models,
      lastAccessed: Date.now(),
    });

    return {
      connection,
      models,
      dbName,
    };
  } catch (err: any) {
    throw new AppError(
      `Failed to initialize tenant database connection for '${dbName}': ${err.message}`,
      500,
      'TENANT_DB_CONNECTION_ERROR'
    );
  }
};

/**
 * Closes all tenant database connections gracefully during shutdown.
 */
export const closeAllTenantConnections = async (): Promise<void> => {
  const closePromises: Promise<void>[] = [];

  for (const [tenantId, cached] of tenantConnectionPool.entries()) {
    closePromises.push(
      cached.connection.close().catch((err) => {
        console.error(`Error closing connection for tenant ${tenantId}:`, err);
      })
    );
  }

  await Promise.all(closePromises);
  tenantConnectionPool.clear();
};

/**
 * Returns connection metrics for health and gateway monitoring.
 */
export const getActiveConnectionStats = () => {
  const tenants: string[] = [];
  const databaseNames: string[] = [];

  for (const [tenantId, cached] of tenantConnectionPool.entries()) {
    if (cached.connection.readyState === 1) {
      tenants.push(tenantId);
      databaseNames.push(`ledgerguard_${tenantId}`);
    }
  }

  return {
    activeConnections: tenants.length,
    activeTenants: tenants,
    isolatedDatabases: databaseNames,
  };
};
