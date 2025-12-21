/**
 * API Service - PRODUCTION VERSION (ES6)
 * Hỗ trợ accessToken và refreshToken
 */
import { CONFIG } from '../config.js';

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to token refresh
function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

// Notify all subscribers when token is refreshed
function onTokenRefreshed(newToken) {
    refreshSubscribers.forEach(callback => callback(newToken));
    refreshSubscribers = [];
}

export const ApiService = {
    /**
     * Lấy access token từ localStorage
     */
    getAccessToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN) 
            || localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN); // Fallback for legacy
    },

    /**
     * Lấy refresh token từ localStorage
     */
    getRefreshToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    },

    /**
     * Lưu tokens vào localStorage
     */
    saveTokens(accessToken, refreshToken) {
        if (accessToken) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, accessToken); // Legacy support
        }
        if (refreshToken) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
    },

    /**
     * Xóa tất cả tokens
     */
    clearTokens() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    },

    /**
     * Tạo headers cho request
     */
    getHeaders(isFormData = false) {
        const headers = {};
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        const token = this.getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    /**
     * Build full URL
     */
    buildUrl(endpoint) {
        return `${CONFIG.API_BASE_URL}${CONFIG.API_PREFIX}${endpoint}`;
    },

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            // Use COMMON_PREFIX for auth endpoints
            const url = `${CONFIG.API_BASE_URL}${CONFIG.COMMON_PREFIX}/auth/refresh`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const responseData = await response.json();
            
            // API Response structure: { success: true, data: { accessToken, refreshToken } }
            const tokens = responseData.data || responseData; 

            // Lưu tokens mới
            this.saveTokens(tokens.accessToken, tokens.refreshToken);
            
            return tokens.accessToken;
        } catch (error) {
            // Refresh thất bại -> đăng xuất
            this.clearTokens();
            window.location.pathname = '/login';
            throw error;
        }
    },

    /**
     * Main request function với auto-refresh token
     */
    async request(endpoint, options = {}, retryCount = 0) {
        const url = this.buildUrl(endpoint);
        const isFormData = options.body instanceof FormData;
        
        const fetchOptions = {
            ...options,
            headers: {
                ...this.getHeaders(isFormData),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, fetchOptions);
            
            // Nếu 401 Unauthorized và chưa retry
            if (response.status === 401 && retryCount === 0) {
                // Nếu đang refresh, đợi kết quả
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        subscribeTokenRefresh(async (newToken) => {
                            try {
                                fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
                                const retryResponse = await fetch(url, fetchOptions);
                                if (!retryResponse.ok) {
                                    throw new Error(`HTTP ${retryResponse.status}`);
                                }
                                resolve(await retryResponse.json());
                            } catch (err) {
                                reject(err);
                            }
                        });
                    });
                }

                // Bắt đầu refresh token
                isRefreshing = true;
                
                try {
                    const newToken = await this.refreshAccessToken();
                    isRefreshing = false;
                    onTokenRefreshed(newToken);
                    
                    // Retry request với token mới
                    return this.request(endpoint, options, retryCount + 1);
                } catch (refreshError) {
                    isRefreshing = false;
                    throw refreshError;
                }
            }
            
            if (!response.ok) {
                // Handle 413 specific
                if (response.status === 413) {
                    throw new Error('File quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
                }
                
                const contentType = response.headers.get('content-type');
                let errorData = {};
                
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json().catch(() => ({}));
                } else {
                    // Handle HTML or text response (common for 500/404/413 from Nginx/Express)
                    const text = await response.text();
                    console.error('Non-JSON Error Response:', text);
                    errorData = { message: 'Có lỗi xảy ra trên server (HTML Response)' };
                }

                const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
                const error = new Error(errorMessage);
                error.data = errorData; // Attach full error data
                throw error;
            }
            
            return await response.json();
        } catch (error) {
            throw error;
        }
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
