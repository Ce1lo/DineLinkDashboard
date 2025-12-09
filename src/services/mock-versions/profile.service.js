/**
 * Profile Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const ProfileService = {
    async getProfile() {
        return MockHandlers.getProfile();
    },

    async update(data) {
        return MockHandlers.updateProfile(data);
    },

    async uploadAvatar(formData) {
        return MockHandlers.uploadAvatar(formData);
    },

    async changePassword(data) {
        return MockHandlers.changePassword(data.currentPassword, data.newPassword);
    }
};
