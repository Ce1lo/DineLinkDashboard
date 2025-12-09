/**
 * Profile Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const ProfileService = {
    async getProfile() {
        return ApiService.get('/profile');
    },

    async update(data) {
        return ApiService.patch('/profile', data);
    },

    async uploadAvatar(formData) {
        return ApiService.upload('/profile/avatar', formData.get('avatar'));
    },

    async changePassword(data) {
        return ApiService.post('/profile/change-password', data);
    }
};
