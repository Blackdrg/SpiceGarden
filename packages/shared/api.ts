const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';

interface RequestOptions extends RequestInit {
  token?: string;
}

interface ApiResponse<T> {
  data: T;
  refreshToken?: string;
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { token, ...rest } = options;

  const headers = new Headers(rest.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await makeRequest<T>(endpoint, { ...rest, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    const errorMessage = error.message || `HTTP ${response.status}`;

    if (response.status === 401 && !endpoint.includes('/auth/refresh-token')) {
      try {
        const csrfToken = getCsrfToken();
        const refreshHeaders = new Headers();
        refreshHeaders.set('Content-Type', 'application/json');
        if (csrfToken) {
          refreshHeaders.set('x-csrf-token', csrfToken);
        }

        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: refreshHeaders,
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const retryHeaders = new Headers(rest.headers);
          retryHeaders.set('Content-Type', 'application/json');
          if (token) {
            retryHeaders.set('Authorization', `Bearer ${token}`);
          }
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...rest,
            headers: retryHeaders,
            credentials: 'include',
          });
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return { data: retryData };
          }
        }
      } catch {
        // Refresh failed, fall through to throw original error
      }
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return { data };
}

async function makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  const { token, ...rest } = options;
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const csrfToken = getCsrfToken();
  if (csrfToken && rest.method && rest.method !== 'GET' && rest.method !== 'HEAD' && rest.method !== 'OPTIONS') {
    headers.set('x-csrf-token', csrfToken);
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    credentials: 'include',
  });
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ user?: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { fullName: string; email: string; phone: string; password: string }) =>
    api<{ user?: unknown }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refreshToken: () =>
    api<{ refresh_token: string }>('/auth/refresh-token', {
      method: 'POST',
    }),
};

export const restaurantsApi = {
  list: async (lat?: number, lng?: number) => {
    return await api<unknown[]>('/restaurants', {
      method: 'GET',
      headers: lat && lng ? { 'x-location': `${lat},${lng}` } : undefined,
    });
  },

  get: (id: string) => api<unknown>(`/restaurants/${id}`),

  search: (query: string) => api<unknown[]>(`/restaurants/search?q=${encodeURIComponent(query)}`),
};

export const ordersApi = {
  list: () => api<unknown[]>('/orders'),

  get: (id: string) => api<unknown>(`/orders/${id}`),

  create: (data: unknown) =>
    api<unknown>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  track: (id: string) => api<unknown>(`/orders/${id}/track`),
};

export const addressesApi = {
  list: () => api<unknown[]>('/addresses'),

  create: (data: unknown) =>
    api<unknown>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  setDefault: (id: string) =>
    api<unknown>(`/addresses/${id}/default`, {
      method: 'PUT',
    }),

  remove: (id: string) => api<unknown>(`/addresses/${id}`, { method: 'DELETE' }),
};

export const menuApi = {
  list: (restaurantId: string) => api<unknown[]>(`/restaurants/${restaurantId}/menu`),

  categories: (restaurantId: string) => api<unknown[]>(`/restaurants/${restaurantId}/categories`),
};


export interface LegalDocument {
  id: string;
  type: string;
  title: string;
  slug: string;
  currentVersion: number;
  currentVersionId?: string;
  lastUpdated: string;
  language: string;
  version?: string;
  effectiveDate?: string;
  summary?: string;
  sections?: { id: string; title: string; content: string; order: number }[];
}

export interface ConsentRecord {
  id: string;
  region: string;
  consentVersion: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  performance: boolean;
  functional: boolean;
  preference: boolean;
  createdAt: string;
}

export interface PrivacyDashboard {
  userId: string;
  consent: { version: string; analytics: boolean; marketing: boolean } | null;
  activeRequests: number;
  exportsAvailable: number;
  dpdpOfficer: { name: string; email: string; phone: string };
  consentManager: { name: string; email: string } | null;
}

export const legalApi = {
  center: (language = 'en') =>
    api<{ categories: string[]; documents: LegalDocument[] }>(`/legal/center?language=${language}`),

  document: (type: string, language = 'en') =>
    api<LegalDocument>(`/legal/documents/${type}?language=${language}`),

  versions: (type: string, language?: string) =>
    api<{ document: string; currentVersion: number; versions: unknown[] }>(
      `/legal/documents/${type}/versions${language ? `?language=${language}` : ''}`,
    ),

  requiredAcceptances: () => api<{ pending: { type: string; title: string; currentVersion: number }[] }>('/legal/required'),

  accept: (documentId: string, versionId: string, method = 'click_accept') =>
    api<unknown>('/legal/accept', {
      method: 'POST',
      body: JSON.stringify({ documentId, versionId, method }),
    }),

  myAcceptances: () => api<unknown[]>('/legal/me/acceptances'),

  cookieRegistry: () => api<unknown[]>('/legal/cookie-registry'),

  recordConsent: (payload: {
    userId?: string;
    anonymousToken?: string;
    region: string;
    consentVersion: string;
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    performance: boolean;
    functional: boolean;
    preference: boolean;
  }) =>
    api<{ consentId: string; region: string; version: string }>('/legal/consent', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  activeConsent: (token: string) =>
    api<ConsentRecord | null>(`/legal/consent/active?token=${encodeURIComponent(token)}`),

  withdrawConsent: (consentId: string, userId?: string) =>
    api<unknown>(`/legal/consent/${consentId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  dashboard: (userId: string) => api<PrivacyDashboard>(`/privacy/dashboard/${userId}`),

  createRequest: (payload: {
    userId: string;
    type: string;
    regulation: string;
    reason?: string;
    requestId?: string;
  }) =>
    api<unknown>('/privacy/requests', { method: 'POST', body: JSON.stringify(payload) }),

  listRequests: (query = '') => api<unknown[]>(`/privacy/requests${query}`),

  createExport: (payload: { userId: string; regulation: string; format: string; requestId?: string }) =>
    api<unknown>('/privacy/exports', { method: 'POST', body: JSON.stringify(payload) }),

  listExports: (userId: string) => api<unknown[]>(`/privacy/exports/${userId}`),

  downloadExport: (exportId: string) => `${API_BASE_URL}/privacy/exports/${exportId}/download`,

  dpdpInfo: () => api<{ officer: unknown; consentManager: unknown }>('/privacy/dpdp/officer'),
};
export default {
  auth: authApi,
  restaurants: restaurantsApi,
  orders: ordersApi,
  menu: menuApi,
  addresses: addressesApi,
  legal: legalApi,
};