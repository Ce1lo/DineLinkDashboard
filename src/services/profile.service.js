/**
 * Profile Service - PRODUCTION VERSION (ES6)
 * Note: BE may not have dedicated profile endpoints - uses localStorage as fallback
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';

export const ProfileService = {
    async getProfile() {
        try {
            // API docs: GET /api/v1/dashboard/accounts/me
            const response = await ApiService.get('/accounts/me');
            const data = response.data || response;
            
            // Map common fields
            if (data) {
                // Determine name field
                data.name = data.full_name || data.display_name || data.name;
                // Normalize avatar URL with API_BASE_URL
                const avatarPath = data.avatar_url || data.avatar;
                if (avatarPath && !avatarPath.startsWith('http')) {
                    data.avatar = `${CONFIG.API_BASE_URL}${avatarPath}`;
                } else {
                    data.avatar = avatarPath;
                }
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
            // API docs: PATCH /api/v1/dashboard/accounts/me/profile
            const payload = {
                full_name: data.name,
                avatar_url: data.avatar || data.avatarUrl
            };
            const response = await ApiService.patch('/accounts/me/profile', payload);
            
            // Update stored user
            const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
            if (userStr) {
                const user = JSON.parse(userStr);
                user.name = data.name || user.name;
                user.avatar = data.avatar || data.avatarUrl || user.avatar;
                user.avatar_url = data.avatar || data.avatarUrl || user.avatar_url;
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
            // API docs: POST /api/v1/dashboard/uploads/images/restaurant-accounts/avatar
            // Field name: 'file'
            const file = formData.get('avatar') || formData.get('file');
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const response = await ApiService.post('/uploads/images/restaurant-accounts/avatar', uploadFormData);
            
            // Step 2: Update the profile with the new avatar URL
            // Wrapped in try-catch to not break flow if PATCH fails
            if (response.success && response.data) {
                const avatarPath = response.data.path || response.data.url;
                if (avatarPath) {
                    try {
                        await this.update({ avatarUrl: avatarPath });
                    } catch (updateError) {
                        console.warn('Failed to update profile with avatar path:', updateError.message);
                        // Still return success since file was uploaded
                    }
                }
            }
            return response;
        } catch (error) {
            console.warn('Avatar upload error:', error);
            return { success: false, message: error.message || 'Upload failed' };
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
