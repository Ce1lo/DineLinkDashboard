/**
 * Notifications Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const NotificationsService = {
    async getList(params = {}) {
        return MockHandlers.getNotifications(params);
    },

    async getUnreadCount() {
        return MockHandlers.getUnreadCount();
    },

    async markAsRead(id) {
        return MockHandlers.markAsRead(id);
    },

    async markAllAsRead() {
        return MockHandlers.markAllAsRead();
    }
};
