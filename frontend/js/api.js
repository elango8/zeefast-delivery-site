/**
 * ZeeFast API Client
 * Fetch wrapper for backend communication
 */

const API_BASE_URL = '/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    getToken() {
        return localStorage.getItem('zeefast_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }

    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// API Methods
const api = new ApiClient();

// Auth
const Auth = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    signup: (data) => api.post('/auth/signup', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    addAddress: (data) => api.post('/auth/addresses', data),
    deleteAddress: (id) => api.delete(`/auth/addresses/${id}`)
};

// Restaurants
const Restaurants = {
    getAll: (params = '') => api.get(`/restaurants${params}`),
    getById: (id) => api.get(`/restaurants/${id}`),
    search: (query) => api.get(`/restaurants/search?q=${encodeURIComponent(query)}`),
    getCuisines: () => api.get('/restaurants/cuisines')
};

// Menu
const Menu = {
    getByRestaurant: (id, params = '') => api.get(`/menu/${id}${params}`),
    getItem: (id) => api.get(`/menu/item/${id}`),
    getPopular: (limit = 10) => api.get(`/menu/popular?limit=${limit}`),
    getSimilar: (id) => api.get(`/menu/similar/${id}`),
    search: (query) => api.get(`/menu/search?q=${encodeURIComponent(query)}`)
};

// Cart
const Cart = {
    get: () => api.get('/cart'),
    add: (itemId, quantity = 1) => api.post('/cart/add', { itemId, quantity }),
    update: (itemId, quantity) => api.put('/cart/update', { itemId, quantity }),
    remove: (itemId) => api.delete(`/cart/item/${itemId}`),
    clear: () => api.delete('/cart')
};

// Orders
const Orders = {
    create: (data) => api.post('/orders', data),
    getAll: (params = '') => api.get(`/orders${params}`),
    getById: (id) => api.get(`/orders/${id}`),
    reorder: (id) => api.post(`/orders/${id}/reorder`),
    cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
    getReorderSuggestions: () => api.get('/orders/reorder-suggestions')
};

// Recommendations  
const Recommendations = {
    getPersonalized: (limit = 10) => api.get(`/recommendations?limit=${limit}`),
    getFrequent: (limit = 5) => api.get(`/recommendations/frequent?limit=${limit}`),
    search: (query) => api.get(`/recommendations/search?q=${encodeURIComponent(query)}`),
    getTrending: (limit = 8) => api.get(`/recommendations/trending?limit=${limit}`),
    getForYou: (limit = 10) => api.get(`/recommendations/for-you?limit=${limit}`),
    getSimilar: (id) => api.get(`/recommendations/similar/${id}`)
};

// Export
window.API = { Auth, Restaurants, Menu, Cart, Orders, Recommendations };
