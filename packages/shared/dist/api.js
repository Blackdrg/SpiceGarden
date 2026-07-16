"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuApi = exports.addressesApi = exports.ordersApi = exports.restaurantsApi = exports.authApi = void 0;
exports.api = api;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';
function getCsrfToken() {
    if (typeof document === 'undefined')
        return null;
    const match = document.cookie.match(/(?:^|; )_csrf=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}
async function api(endpoint, options = {}) {
    const { token, ...rest } = options;
    const headers = new Headers(rest.headers);
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await makeRequest(endpoint, { ...rest, headers });
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
            }
            catch {
                // Refresh failed, fall through to throw original error
            }
        }
        throw new Error(errorMessage);
    }
    const data = await response.json();
    return { data };
}
async function makeRequest(endpoint, options = {}) {
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
exports.authApi = {
    login: (email, password) => api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }),
    register: (data) => api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    refreshToken: () => api('/auth/refresh-token', {
        method: 'POST',
    }),
};
exports.restaurantsApi = {
    list: async (lat, lng) => {
        return await api('/restaurants', {
            method: 'GET',
            headers: lat && lng ? { 'x-location': `${lat},${lng}` } : undefined,
        });
    },
    get: (id) => api(`/restaurants/${id}`),
    search: (query) => api(`/restaurants/search?q=${encodeURIComponent(query)}`),
};
exports.ordersApi = {
    list: () => api('/orders'),
    get: (id) => api(`/orders/${id}`),
    create: (data) => api('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    track: (id) => api(`/orders/${id}/track`),
};
exports.addressesApi = {
    list: () => api('/addresses'),
    create: (data) => api('/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    setDefault: (id) => api(`/addresses/${id}/default`, {
        method: 'PUT',
    }),
    remove: (id) => api(`/addresses/${id}`, { method: 'DELETE' }),
};
exports.menuApi = {
    list: (restaurantId) => api(`/restaurants/${restaurantId}/menu`),
    categories: (restaurantId) => api(`/restaurants/${restaurantId}/categories`),
};
exports.default = {
    auth: exports.authApi,
    restaurants: exports.restaurantsApi,
    orders: exports.ordersApi,
    menu: exports.menuApi,
    addresses: exports.addressesApi,
};
