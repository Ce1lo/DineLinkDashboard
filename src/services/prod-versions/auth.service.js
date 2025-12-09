/**
 * Auth Service - PRODUCTION VERSION (ES6)
 * Gọi API thực từ Backend
 */
import { CONFIG } from '../config.js';
import { ApiService } from './api.js';

export const AuthService = {
    async login(email, password) {
        const response = await ApiService.post('/auth/login', { email, password });
        if (response.token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
        return response;
    },

    async registerOwner(data) {
        const response = await ApiService.post('/auth/register-owner', data);
        if (response.token) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, response.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
        return response;
    },

    async registerStaff(data) {
        return ApiService.post('/auth/register-staff', data);
    },

    async getMe() {
        return ApiService.get('/auth/me');
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
