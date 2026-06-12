"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuApi = exports.ordersApi = exports.restaurantsApi = exports.authApi = void 0;
exports.api = api;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Enhanced API function with automatic token refresh
async function api(endpoint, options = {}) {
    const { token, ...rest } = options;
    // Try the request
    try {
        return await makeRequest(endpoint, { token, ...rest });
    }
    catch (error) {
        const err = error;
        // If we get a 401 (Unauthorized) and we have a token, try to refresh
        if (err.message && err.message.includes('401') && token) {
            try {
                // Attempt to refresh token
                const refreshResponse = await api('/auth/refresh-token', {
                    method: 'POST',
                    body: JSON.stringify({ token }),
                });
                const newToken = refreshResponse.data.access_token;
                // Retry the original request with the new token
                return await makeRequest(endpoint, { token: newToken, ...rest });
            }
            catch (refreshError) {
                // If refresh fails, throw the original error
                throw error;
            }
        }
        // If not a 401 or no token to refresh, throw the original error
        throw error;
    }
}
// Helper function to make the actual request
async function makeRequest(endpoint, options = {}) {
    const { token, ...rest } = options;
    const headers = new Headers(rest.headers);
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...rest,
        headers,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    // Check if the response contains a new token (some APIs return refresh token in response)
    // This is optional and depends on your API implementation
    return { data };
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
    // Add refresh token endpoint
    refreshToken: (token) => api('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
    }),
};
exports.restaurantsApi = {
    list: async (lat, lng) => {
        try {
            return await api('/restaurants', {
                method: 'GET',
                headers: lat && lng ? { 'x-location': `${lat},${lng}` } : undefined,
            });
        }
        catch (error) {
            console.warn('Backend unavailable, returning mock data');
            return [
                { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Spice Garden - Downtown', description: 'Biryani, Karahi, Naan', rating: 4.5, deliveryTime: 30, isActive: true },
                { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Spice Garden - Mall Road', description: 'Burger, Fries, Shake', rating: 4.3, deliveryTime: 25, isActive: true },
                { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Spice Garden - Gulshan', description: 'Pizza, Pasta, Salad', rating: 4.7, deliveryTime: 35, isActive: true },
            ];
        }
    },
    get: (id) => api(`/restaurants/${id}`),
    search: (query) => api(`/restaurants/search?q=${encodeURIComponent(query)}`),
};
exports.ordersApi = {
    list: (token) => api('/orders', { token }),
    get: (id, token) => api(`/orders/${id}`, { token }),
    create: (data, token) => api('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
    }),
    track: (id) => api(`/orders/${id}/track`),
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
};
