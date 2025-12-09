/**
 * Auth Service - MOCK VERSION (ES6)
 * Sử dụng MockHandlers thay vì gọi API thực
 */
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const AuthService = {
    async login(email, password) {
        const response = await MockHandlers.login(email, password);
        if (response.token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
        return response;
    },

    async registerOwner(data) {
        await MockHandlers.delay(500);
        const newUser = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            role: 'OWNER',
            avatar: null,
            restaurantId: Date.now() + 1,
            restaurantName: data.restaurantName
        };
        const token = 'mock_jwt_token_owner_' + Date.now();
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(newUser));
        return { success: true, message: 'Đăng ký thành công!', token, user: newUser };
    },

    async registerStaff(data) {
        await MockHandlers.delay(500);
        return { success: true, message: 'Đã gửi yêu cầu, vui lòng chờ quản lý duyệt!', requiresApproval: true };
    },

    async getMe() {
        return MockHandlers.getProfile();
    },

    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        window.location.hash = '#/login';
    },

    isAuthenticated() {
        return !!localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },

    getStoredUser() {
        const user = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    updateStoredUser(data) {
        const user = this.getStoredUser();
        if (user) {
            Object.assign(user, data);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
        }
    }
};
