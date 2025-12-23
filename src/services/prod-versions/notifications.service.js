/**
 * Notifications Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const NotificationsService = {
    async getList(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            // console.log('📢 [Notifications] Fetching:', `/notifications${query ? '?' + query : ''}`);
            const response = await ApiService.get(`/notifications${query ? '?' + query : ''}`);
            // console.log('📢 [Notifications] Response:', response);
            
            // BE returns: { success: true, data: { items: [...], pagination: {...} } }
            const data = response.data || response;
            // data can be { items: [...], pagination: {...} } or directly an array
            const items = data.items || (Array.isArray(data) ? data : []);
            const pagination = data.pagination || {};
            
            return { 
                data: { items, pagination }, 
                success: true 
            };
        } catch (error) {
            console.warn('Could not fetch notifications:', error);
            return { data: { items: [], pagination: {} }, success: false };
        }
    },

    async getUnreadCount() {
        try {
            const response = await ApiService.get('/notifications/unread-count');
            // BE returns: { data: { unreadCount: 5 } }
            const data = response.data || response;
            return { count: data.unreadCount || data.count || 0 };
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
    },

    async delete(id) {
        const response = await ApiService.delete(`/notifications/${id}`);
        return { success: true, ...response };
    }
};
