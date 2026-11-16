import { AuthUser, TenantContextData } from '../types';

const TOKEN_KEY = 'ledgerguard_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Unauthorized callback registry for auto-logout
type UnauthorizedListener = () => void;
const unauthorizedListeners: Set<UnauthorizedListener> = new Set();

export const onUnauthorized = (listener: UnauthorizedListener): (() => void) => {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
};

const notifyUnauthorized = () => {
  clearStoredToken();
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error in unauthorized listener:', err);
    }
  });
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

/**
 * Universal fetch wrapper with automatic JWT token attachment and 401 interceptor
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: `Server returned non-JSON response (${response.status})`,
  }));

  if (response.status === 401) {
    notifyUnauthorized();
    throw new Error(json.message || 'Session expired or invalid credentials');
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json.data as T;
}

/**
 * Authenticates user credentials via POST /api/v1/auth/login
 */
export async function loginRequest(
  email: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  return apiFetch<{ token: string; user: AuthUser }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Verifies JWT token and retrieves identity via GET /api/v1/auth/me
 */
export async function fetchCurrentUser(): Promise<{
  user: AuthUser;
  tenantContext: { tenantId: string; tenantName: string };
}> {
  return apiFetch<{
    user: AuthUser;
    tenantContext: { tenantId: string; tenantName: string };
  }>('/api/v1/auth/me', {
    method: 'GET',
  });
}

/**
 * Resolves current tenant's isolated database profile & audit logs via GET /api/v1/tenant/context
 */
export async function fetchTenantContext(): Promise<TenantContextData> {
  return apiFetch<TenantContextData>('/api/v1/tenant/context', {
    method: 'GET',
  });
}
