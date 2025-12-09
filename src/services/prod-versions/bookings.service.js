/**
 * Bookings Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const BookingsService = {
    async getList(params = {}) {
        const query = new URLSearchParams(params).toString();
        return ApiService.get(`/bookings${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return ApiService.get(`/bookings/${id}`);
    },

    async confirm(id) {
        return ApiService.post(`/bookings/${id}/confirm`);
    },

    async cancel(id) {
        return ApiService.post(`/bookings/${id}/cancel`);
    },

    async assignTable(id, tableId) {
        return ApiService.post(`/bookings/${id}/assign-table`, { tableId });
    },

    async checkIn(id) {
        return ApiService.post(`/bookings/${id}/check-in`);
    },

    async noShow(id) {
        return ApiService.post(`/bookings/${id}/no-show`);
    }
};
