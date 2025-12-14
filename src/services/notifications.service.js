/**
 * Notifications Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const NotificationsService = {
    async getList(params = {}) {
        if (CONFIG.USE_MOCK) return MockHandlers.getNotifications(params);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await ApiService.get(`/notifications${query ? '?' + query : ''}`);
            // Handle various response formats
            const data = response.data || response;
            return { data: Array.isArray(data) ? data : [], success: true };
        } catch (error) {
            console.warn('Could not fetch notifications, using Mock:', error);
            return MockHandlers.getNotifications(params);
        }
    },

    async getUnreadCount() {
        if (CONFIG.USE_MOCK) return MockHandlers.getUnreadCount();
        try {
            const response = await ApiService.get('/notifications/unread-count');
            return response.data || response;
        } catch (error) {
             return MockHandlers.getUnreadCount();
        }
    },

    async markAsRead(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.markAsRead(id);
        try {
            // BE uses PATCH not POST
            const response = await ApiService.patch(`/notifications/${id}/read`, {});
            return { success: true, ...response };
        } catch (error) {
             return MockHandlers.markAsRead(id);
        }
    },

    async markAllAsRead() {
        if (CONFIG.USE_MOCK) return MockHandlers.markAllAsRead();
        try {
            // BE uses PATCH not POST
            const response = await ApiService.patch('/notifications/read-all', {});
            return { success: true, ...response };
        } catch (error) {
             return MockHandlers.markAllAsRead();
        }
    },

    async delete(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.deleteNotification(id);
        try {
            const response = await ApiService.delete(`/notifications/${id}`);
            return { success: true, ...response };
        } catch (error) {
            return MockHandlers.deleteNotification(id);
        }
    },

    async deleteAll() {
        if (CONFIG.USE_MOCK) return MockHandlers.deleteAllNotifications();
        try {
            const response = await ApiService.delete('/notifications');
            return { success: true, ...response };
        } catch (error) {
            return MockHandlers.deleteAllNotifications();
        }
    }
};
