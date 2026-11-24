import { 
  AuthUser, 
  TenantContextData, 
  BillingSummaryResponse, 
  BillingTransactionsResponse, 
  CreateBillingTransactionPayload, 
  CreateBillingTransactionResponse 
} from '../types';

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

/**
 * Retrieves the current tenant's account balance and recent transactions via GET /api/v1/billing/summary
 */
export async function fetchBillingSummary(): Promise<BillingSummaryResponse> {
  return apiFetch<BillingSummaryResponse>('/api/v1/billing/summary', {
    method: 'GET',
  });
}

/**
 * Retrieves paginated ledger transactions isolated to the current tenant via GET /api/v1/billing/transactions
 */
export async function fetchBillingTransactions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}): Promise<BillingTransactionsResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status && params.status !== 'All') query.set('status', params.status);
  if (params?.type && params.type !== 'All') query.set('type', params.type);

  const qs = query.toString();
  const endpoint = qs ? `/api/v1/billing/transactions?${qs}` : '/api/v1/billing/transactions';

  return apiFetch<BillingTransactionsResponse>(endpoint, {
    method: 'GET',
  });
}

/**
 * Executes an atomic idempotent transaction via POST /api/v1/billing/transactions
 * Sends the Idempotency-Key header and returns { data, replayed }
 */
export async function submitBillingTransaction(
  payload: CreateBillingTransactionPayload,
  idempotencyKey: string
): Promise<{ data: CreateBillingTransactionResponse; replayed: boolean }> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey.trim(),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/v1/billing/transactions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json: ApiResponse<CreateBillingTransactionResponse> & { replayed?: boolean } = await response
    .json()
    .catch(() => ({
      success: false,
      message: `Server returned non-JSON response (${response.status})`,
    }));

  if (response.status === 401) {
    notifyUnauthorized();
    throw new Error(json.message || 'Session expired or invalid credentials');
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Transaction submission failed with status ${response.status}`);
  }

  const isReplayed =
    response.headers.get('x-idempotency-replayed') === 'true' || Boolean(json.replayed);

  return {
    data: json.data as CreateBillingTransactionResponse,
    replayed: isReplayed,
  };
}
