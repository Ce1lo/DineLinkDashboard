/**
 * Profile Service - PRODUCTION VERSION (ES6)
 * Note: BE may not have dedicated profile endpoints - uses localStorage as fallback
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';

export const ProfileService = {
    async getProfile() {
        try {
            // Try to get from API first
            const response = await ApiService.get('/auth/me');
            const data = response.data || response;
            
            // Map common fields
            if (data) {
                // Determine name field
                data.name = data.full_name || data.display_name || data.name;
                data.avatar = data.avatar_url || data.avatar;
            }
            return data;
        } catch (error) {
            // Fallback to stored user data
            const user = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
            return user ? JSON.parse(user) : null;
        }
    },

    async update(data) {
        try {
            // Transform FE camelCase to BE snake_case
            const payload = {
                full_name: data.name,
                // email is read-only usually
                avatar_url: data.avatar || data.avatarUrl
            };
            const response = await ApiService.patch('/auth/me', payload);
            
            // Update stored user
            const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
            if (userStr) {
                const user = JSON.parse(userStr);
                user.name = data.name || user.name;
                user.avatar = data.avatar || data.avatarUrl || user.avatar;
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
            }
            return { success: true, ...response };
        } catch (error) {
            console.warn('Profile update error:', error);
            return { success: false, message: error.message || 'Update failed' };
        }
    },

    async uploadAvatar(formData) {
        try {
            // Assuming we have a general upload endpoint that returns URL
            const response = await ApiService.upload('/uploads/avatar', formData.get('avatar'));
            // Then we update the profile with the new URL
            if (response.success && response.data && response.data.url) {
                await this.update({ avatarUrl: response.data.url });
            }
            return response;
        } catch (error) {
            console.warn('Avatar upload endpoint not available');
            return { success: false, message: 'Endpoint not available' };
        }
    },

    async changePassword(data) {
        try {
            // Transform to match potential BE format
            const payload = {
                current_password: data.currentPassword,
                new_password: data.newPassword,
                confirm_password: data.confirmNewPassword
            };
            const response = await ApiService.post('/auth/change-password', payload);
            return { success: true, ...response };
        } catch (error) {
            return { success: false, message: error.message || 'Endpoint not available' };
        }
    }
};
