import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { JwtPayload, UserRole, AuthenticatedUser } from '../../types/auth.types';

interface SeedUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
}

// In-memory enterprise user registry seeded with bcrypt-hashed credentials
const SEED_USERS: SeedUser[] = [
  {
    id: 'usr_acme_admin_01',
    email: 'admin@acme.ledgerguard.io',
    name: 'Acme Enclave Administrator',
    passwordHash: bcrypt.hashSync('Acme@2026!', 10),
    role: 'TENANT_ADMIN',
    tenantId: 'tenant_acme',
    tenantName: 'Acme Financial Corp',
  },
  {
    id: 'usr_globex_admin_02',
    email: 'admin@globex.ledgerguard.io',
    name: 'Globex Clearing Administrator',
    passwordHash: bcrypt.hashSync('Globex@2026!', 10),
    role: 'TENANT_ADMIN',
    tenantId: 'tenant_globex',
    tenantName: 'Globex Clearing House',
  },
  {
    id: 'usr_platform_secops_03',
    email: 'secops@ledgerguard.io',
    name: 'Platform Security Officer',
    passwordHash: bcrypt.hashSync('Guard@2026!', 10),
    role: 'PLATFORM_ADMIN',
    tenantId: 'tenant_platform',
    tenantName: 'LedgerGuard Root Enclave',
  },
];

/**
 * Generates a signed JWT with tenant isolation claims
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as any,
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
};

/**
 * Cryptographically verifies JWT signature and extracts tenant claims
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as JwtPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Authentication token has expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid or malformed authentication token', 401, 'INVALID_TOKEN');
  }
};

/**
 * Authenticates user credentials and returns JWT plus user tenant profile
 */
export const authenticateUser = async (
  email: string,
  password: string
): Promise<{ token: string; user: AuthenticatedUser }> => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = SEED_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenantName,
  };

  const token = generateToken(tokenPayload);

  const sanitizedUser: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenantName,
  };

  return { token, user: sanitizedUser };
};
