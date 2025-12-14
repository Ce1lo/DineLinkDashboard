/**
 * Notifications Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const NotificationsService = {
    async getList(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await ApiService.get(`/notifications${query ? '?' + query : ''}`);
            // Handle various response formats
            const data = response.data || response;
            return { data: Array.isArray(data) ? data : [], success: true };
        } catch (error) {
            console.warn('Could not fetch notifications:', error);
            return { data: [], success: false };
        }
    },

    async getUnreadCount() {
        try {
            const response = await ApiService.get('/notifications/unread-count');
            return response.data || response;
        } catch (error) {
            return { count: 0 };
        }
    },

    async markAsRead(id) {
        // BE uses PATCH not POST
        const response = await ApiService.patch(`/notifications/${id}/read`, {});
        return { success: true, ...response };
    },

    async markAllAsRead() {
        // BE uses PATCH not POST
        const response = await ApiService.patch('/notifications/read-all', {});
        return { success: true, ...response };
    }
};
