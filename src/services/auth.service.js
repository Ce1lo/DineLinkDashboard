/**
 * Auth Service - PRODUCTION VERSION (ES6)
 * Gọi API thực từ Backend
 * Hỗ trợ accessToken và refreshToken
 */
import { CONFIG } from '../config.js';
import { ApiService } from './api.js';

export const AuthService = {
    /**
     * Đăng nhập - lưu cả accessToken và refreshToken
     * BE Response format: { success, message, data: { account, restaurant, tokens: { accessToken, refreshToken } } }
     */
    async login(email, password) {
        const response = await ApiService.post('/auth/login', { email, password });
        console.log('Login response:', response); // Debug log
        
        // BE wrap response trong { success, data: {...} }
        const resData = response.data || response;
        const tokens = resData.tokens || {};
        
        if (tokens.accessToken || resData.accessToken || resData.token) {
            // Lưu tokens
            ApiService.saveTokens(
                tokens.accessToken || resData.accessToken || resData.token,
                tokens.refreshToken || resData.refreshToken
            );
            // Lưu user info (account từ BE)
            const user = resData.account || resData.user;
            if (user) {
                // Thêm restaurant info vào user
                user.restaurant = resData.restaurant;
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
            }
        }
        
        // Return format cho FE kiểm tra
        const finalUser = resData.account || resData.user || {};
        if (finalUser) {
            // Map snake_case to camelCase for FE consistency
            finalUser.name = finalUser.display_name || finalUser.full_name || finalUser.name;
            finalUser.avatar = finalUser.avatar_url || finalUser.avatar;
            // Ensure restaurant info is attached if available
            if (resData.restaurant) {
                finalUser.restaurant = resData.restaurant;
            }
            // Update storage with mapped user
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(finalUser));
        }

        return {
            ...resData,
            token: tokens.accessToken || resData.accessToken || resData.token,
            accessToken: tokens.accessToken || resData.accessToken,
            user: finalUser
        };
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

    async forgotPassword(email) {
        return ApiService.post('/auth/forgot-password', { email });
    },

    /**
     * Đặt lại mật khẩu (Verify OTP + Password)
     * payload: { email, reset_token, new_password }
     */
    async resetPassword(payload) {
        return ApiService.post('/auth/reset-password', payload);
    },

    async getMe() {
        // Return stored user for now as /auth/me does not exist
        return { success: true, data: this.getStoredUser() };
    },

    /**
     * Đăng xuất - xóa tất cả tokens
     */
    async logout() {
        try {
            const refreshToken = ApiService.getRefreshToken();
            if (refreshToken) {
                // Gọi API logout thực tế (ApiService sẽ tự dùng /common/auth/logout)
                await ApiService.post('/auth/logout', { refreshToken }).catch(() => {});
            }
        } catch (error) {
            console.warn('Logout error:', error);
        } finally {
            ApiService.clearTokens();
            window.location.pathname = '/login';
        }
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
    }
};
