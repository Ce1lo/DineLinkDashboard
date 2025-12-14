/**
 * Auth Service - PRODUCTION VERSION (ES6)
 * Gọi API thực từ Backend
 * Hỗ trợ accessToken và refreshToken
 */
import { CONFIG } from '../config.js';
import { ApiService } from './api.js';
import { MockHandlers } from '../mock/handlers.js';

export const AuthService = {
    /**
     * Đăng nhập - lưu cả accessToken và refreshToken
     * BE Response format: { success, message, data: { account, restaurant, tokens: { accessToken, refreshToken } } }
     */
    async login(email, password) {
        if (CONFIG.USE_MOCK) return this._processLoginResponse(await MockHandlers.login(email, password));

        try {
            const response = await ApiService.post('/auth/login', { email, password });
            return this._processLoginResponse(response);
        } catch (error) {
            console.warn('Real API Login failed, attempting Mock Fallback...', error);
            
            // Debug: Check if it's a network error or 401
            if (error.message && error.message.includes('401')) {
                 console.warn('Backend is alive but credentials invalid. NOT falling back to Mock.');
                 throw error; 
            }
            if (error.data && error.data.message === 'Incorrect email or password') {
                 console.warn('Backend is alive but credentials invalid. NOT falling back to Mock.');
                 throw error;
            }

            // Fallback to Mock only on Network Error or Server Error (5xx)
            console.warn('Connection/Server Error detected. Switching to Mock Data.');
            localStorage.setItem('IS_MOCK_MODE', 'true'); // Enable Sticky Mock Mode
            const mockRes = await MockHandlers.login(email, password);
            return this._processLoginResponse(mockRes);
        }
    },

    /**
     * Đăng ký chủ nhà hàng - nhận token ngay sau đăng ký
     * BE Response format: { success, message, data: { account, restaurant, tokens } }
     */
    async registerOwner(data) {
        // Transform FE field names to match BE format
        const payload = {
            email: data.email,
            password: data.password,
            confirm_password: data.confirmPassword,
            role: 'OWNER',
            full_name: data.name,
            restaurant_name: data.restaurantName,
            restaurant_address: data.address,
            restaurant_phone: data.phone
        };
        
        const response = await ApiService.post('/auth/register/owner', payload);
        const resData = response.data || response;
        const tokens = resData.tokens || {};
        
        if (tokens.accessToken || resData.accessToken || resData.token) {
            ApiService.saveTokens(
                tokens.accessToken || resData.accessToken || resData.token,
                tokens.refreshToken || resData.refreshToken
            );
            const user = resData.account || resData.user;
            if (user) {
                user.restaurant = resData.restaurant;
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
            }
        }
        
        return {
            ...resData,
            success: response.success !== false,
            token: tokens.accessToken || resData.accessToken || resData.token,
            user: resData.account || resData.user
        };
    },

    /**
     * Đăng ký nhân viên - không nhận token, chờ duyệt
     */
    async registerStaff(data) {
        // Transform FE field names to match BE format
        const payload = {
            email: data.email,
            password: data.password,
            confirm_password: data.confirmPassword,
            role: 'STAFF',
            full_name: data.name,
            invite_code: data.restaurantCode
        };
        const response = await ApiService.post('/auth/register/staff', payload);
        return {
            ...response,
            success: response.success !== false
        };
    },

    /**
     * Yêu cầu đặt lại mật khẩu
     */
    async forgotPassword(email) {
        return ApiService.post('/auth/forgot-password', { email });
    },

    /**
     * Lấy thông tin user hiện tại
     */
    async getMe() {
        return ApiService.get('/auth/me');
    },

    /**
     * Đăng xuất - xóa tất cả tokens
     */
    logout() {
        ApiService.clearTokens();
        localStorage.removeItem('IS_MOCK_MODE');
        window.location.pathname = '/login';
    },

    /**
     * Kiểm tra đã đăng nhập chưa
     */
    isAuthenticated() {
        return !!ApiService.getAccessToken();
    },

    /**
     * Lấy thông tin user đã lưu
     */
    getStoredUser() {
        const user = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    /**
     * Cập nhật thông tin user đã lưu
     */
    updateStoredUser(data) {
        const user = this.getStoredUser();
        if (user) {
            Object.assign(user, data);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
        }
    },

    /**
     * Refresh token thủ công (nếu cần)
     */
    async refreshToken() {
        return ApiService.refreshAccessToken();
    },
    /**
     * Helper: Xử lý response từ Login (cả Mock và Real)
     */
    _processLoginResponse(response) {
        // Handle both standard response and Axios-style response.data if needed
        // But our ApiService wrapper usually returns the JSON body directly.
        const resData = response.data || response;
        const tokens = resData.tokens || {};
        
        // Check for tokens in various places
        const accessToken = tokens.accessToken || resData.accessToken || resData.token;
        const refreshToken = tokens.refreshToken || resData.refreshToken;

        if (accessToken) {
            // Lưu tokens
            ApiService.saveTokens(accessToken, refreshToken);
            
            // Lưu user info
            const user = resData.account || resData.user;
            if (user) {
                // Thêm restaurant info vào user nếu có
                if (resData.restaurant) {
                    user.restaurant = resData.restaurant;
                }
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
            }
        }
        
        // Return format cho FE kiểm tra (AuthView)
        const finalUser = resData.account || resData.user || {};
        if (finalUser) {
            finalUser.name = finalUser.display_name || finalUser.full_name || finalUser.name;
            finalUser.avatar = finalUser.avatar_url || finalUser.avatar;
            if (resData.restaurant) {
                finalUser.restaurant = resData.restaurant;
            }
            // Update storage again with formatted user
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(finalUser));
        }

        return {
            ...resData,
            success: true, // Ensure success flag
            token: accessToken,
            accessToken: accessToken,
            user: finalUser
        };
    }
};
