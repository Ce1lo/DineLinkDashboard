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
        const headers = {
            // Skip ngrok browser warning page
            'ngrok-skip-browser-warning': '69420'
        };
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
        
        console.log('🔄 [Token Refresh] Starting refresh process...');
        console.log('🔄 [Token Refresh] Refresh token exists:', !!refreshToken);
        
        if (!refreshToken) {
            console.error('🔄 [Token Refresh] No refresh token available');
            throw new Error('No refresh token available');
        }

        try {
            // Use COMMON_PREFIX for auth endpoints
            const url = `${CONFIG.API_BASE_URL}${CONFIG.COMMON_PREFIX}/auth/refresh`;
            console.log('🔄 [Token Refresh] Calling:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            console.log('🔄 [Token Refresh] Response status:', response.status);

            if (!response.ok) {
                // Parse error response for details
                let errorDetail = `Status: ${response.status}`;
                try {
                    const errorBody = await response.json();
                    errorDetail = errorBody.message || errorBody.error?.message || errorDetail;
                    console.error('🔄 [Token Refresh] Error response:', errorBody);
                } catch (e) {
                    console.error('🔄 [Token Refresh] Could not parse error response');
                }
                throw new Error(`Token refresh failed: ${errorDetail}`);
            }

            const responseData = await response.json();
            console.log('🔄 [Token Refresh] Success response:', responseData);
            
            // Handle multiple response formats from BE:
            // Format 1: { success: true, data: { accessToken, refreshToken } }
            // Format 2: { accessToken, refreshToken }
            // Format 3: { success: true, data: { access_token, refresh_token } }
            // Format 4: { data: { tokens: { accessToken, refreshToken } } }
            const data = responseData.data || responseData;
            const tokens = data.tokens || data;
            
            const newAccessToken = tokens.accessToken || tokens.access_token;
            const newRefreshToken = tokens.refreshToken || tokens.refresh_token;

            if (!newAccessToken) {
                console.error('🔄 [Token Refresh] No access token in response:', responseData);
                throw new Error('No access token returned from refresh');
            }

            // Lưu tokens mới
            this.saveTokens(newAccessToken, newRefreshToken);
            console.log('🔄 [Token Refresh] Tokens saved successfully');
            
            return newAccessToken;
        } catch (error) {
            console.error('🔄 [Token Refresh] Failed:', error.message);
            
            // Chỉ logout khi refresh token thực sự không hợp lệ (401/403)
            // Không logout khi network error để user có thể retry
            if (error.message.includes('401') || error.message.includes('403') || 
                error.message.includes('expired') || error.message.includes('invalid') ||
                error.message.includes('No refresh token')) {
                console.error('🔄 [Token Refresh] Token invalid, clearing and redirecting to login');
                this.clearTokens();
                window.location.pathname = '/login';
            } else {
                console.warn('🔄 [Token Refresh] Temporary error, not logging out:', error.message);
            }
            
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
                console.log('🔐 [Auth] Received 401, attempting token refresh...');
                console.log('🔐 [Auth] Endpoint:', endpoint);
                
                // Nếu đang refresh, đợi kết quả
                if (isRefreshing) {
                    console.log('🔐 [Auth] Refresh already in progress, waiting...');
                    return new Promise((resolve, reject) => {
                        subscribeTokenRefresh(async (newToken) => {
                            try {
                                console.log('🔐 [Auth] Got new token from refresh, retrying request...');
                                fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
                                const retryResponse = await fetch(url, fetchOptions);
                                if (!retryResponse.ok) {
                                    throw new Error(`HTTP ${retryResponse.status}`);
                                }
                                resolve(await retryResponse.json());
                            } catch (err) {
                                console.error('🔐 [Auth] Retry after refresh failed:', err.message);
                                reject(err);
                            }
                        });
                    });
                }

                // Bắt đầu refresh token
                isRefreshing = true;
                console.log('🔐 [Auth] Starting token refresh...');
                
                try {
                    const newToken = await this.refreshAccessToken();
                    isRefreshing = false;
                    onTokenRefreshed(newToken);
                    console.log('🔐 [Auth] Token refresh successful, retrying original request...');
                    
                    // Retry request với token mới
                    return this.request(endpoint, options, retryCount + 1);
                } catch (refreshError) {
                    console.error('🔐 [Auth] Token refresh failed:', refreshError.message);
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
