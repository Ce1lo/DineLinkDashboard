/**
 * API Service - Shared for both mock and prod (ES6)
 * Không thay đổi khi toggle
 */
import { CONFIG } from '../config.js';

export const ApiService = {
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },

    getHeaders(isFormData = false) {
        const headers = {};
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    buildUrl(endpoint) {
        return `${CONFIG.API_BASE_URL}${CONFIG.API_PREFIX}${endpoint}`;
    },

    async request(endpoint, options = {}) {
        const url = this.buildUrl(endpoint);
        const isFormData = options.body instanceof FormData;
        
        const fetchOptions = {
            ...options,
            headers: {
                ...this.getHeaders(isFormData),
                ...options.headers
            }
        };

        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        return await response.json();
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, data) {
        const isFormData = data instanceof FormData;
        return this.request(endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        });
    },

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    async upload(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        return this.post(endpoint, formData);
    }
};
