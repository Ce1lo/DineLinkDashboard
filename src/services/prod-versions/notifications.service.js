/**
 * Notifications Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const NotificationsService = {
    async getList(params = {}) {
        const query = new URLSearchParams(params).toString();
        return ApiService.get(`/notifications${query ? '?' + query : ''}`);
    },

    async getUnreadCount() {
        return ApiService.get('/notifications/unread-count');
    },

    async markAsRead(id) {
        return ApiService.post(`/notifications/${id}/read`);
    },

    async markAllAsRead() {
        return ApiService.post('/notifications/read-all');
    }
};
