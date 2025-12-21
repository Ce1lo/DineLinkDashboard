/**
 * Bookings Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const BookingsService = {
    async getList(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await ApiService.get(`/bookings${query ? '?' + query : ''}`);
        // Handle BE response format
        return { data: response.data || response, success: true };
    },

    async getById(id) {
        const response = await ApiService.get(`/bookings/${id}`);
        return response.data || response;
    },

    async confirm(id) {
        // BE uses PATCH not POST
        const response = await ApiService.patch(`/bookings/${id}/confirm`, {});
        return { success: true, ...response };
    },

    async cancel(id) {
        // BE uses PATCH not POST
        const response = await ApiService.patch(`/bookings/${id}/cancel`, {});
        return { success: true, ...response };
    },

    async assignTable(id, tableId) {
        // This might not exist in BE yet
        try {
            const response = await ApiService.patch(`/bookings/${id}/assign-table`, { tableId });
            return { success: true, ...response };
        } catch (error) {
            console.warn('assignTable endpoint not available');
            return { success: false, message: 'Endpoint not available' };
        }
    },

    async checkIn(id) {
        // BE uses "complete" instead of "check-in"
        const response = await ApiService.patch(`/bookings/${id}/complete`, {});
        return { success: true, ...response };
    },

    async noShow(id) {
        // BE uses PATCH not POST
        const response = await ApiService.patch(`/bookings/${id}/no-show`, {});
        return { success: true, ...response };
    }
};
