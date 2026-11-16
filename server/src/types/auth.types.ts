import { Connection } from 'mongoose';
import { TenantModels } from '../models/tenantModels';

export type UserRole = 'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'AUDITOR';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
}

export interface TenantDbContext {
  connection: Connection;
  models: TenantModels;
  dbName: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
      tenantDb?: TenantDbContext;
    }
  }
}
