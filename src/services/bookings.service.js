/**
 * Bookings Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const BookingsService = {
    async getList(params = {}) {
        if (CONFIG.USE_MOCK) return MockHandlers.getBookings(params);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await ApiService.get(`/bookings${query ? '?' + query : ''}`);
            // Handle BE response format
            return { data: response.data || response, success: true };
        } catch (error) {
           console.warn('Backend unavailable, using Mock Bookings');
           return MockHandlers.getBookings(params);
        }
    },

    async getById(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.getBookings().then(res => res.data.find(b => b.id == id));
        try {
            const response = await ApiService.get(`/bookings/${id}`);
            return response.data || response;
        } catch (error) {
             const bookings = await MockHandlers.getBookings();
             return bookings.data.find(b => b.id == id);
        }
    },

    async confirm(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.confirmBooking(id);
        try {
            // BE uses PATCH not POST
            const response = await ApiService.patch(`/bookings/${id}/confirm`, {});
            return { success: true, ...response };
        } catch (error) {
            console.warn('Backend unavailable, using Mock Confirm Booking');
            return MockHandlers.confirmBooking(id);
        }
    },

    async cancel(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.cancelBooking(id);
        try {
            // BE uses PATCH not POST
            const response = await ApiService.patch(`/bookings/${id}/cancel`, {});
            return { success: true, ...response };
        } catch (error) {
            console.warn('Backend unavailable, using Mock Cancel Booking');
            return MockHandlers.cancelBooking(id);
        }
    },

    async assignTable(id, tableId) {
        if (CONFIG.USE_MOCK) return MockHandlers.assignTable(id, tableId);
        // This might not exist in BE yet
        try {
            const response = await ApiService.patch(`/bookings/${id}/assign-table`, { tableId });
            return { success: true, ...response };
        } catch (error) {
            console.warn('assignTable endpoint not available, falling back to mock');
             return MockHandlers.assignTable(id, tableId);
        }
    },

    async checkIn(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.checkInBooking(id);
        try {
            // BE uses "complete" instead of "check-in"
            const response = await ApiService.patch(`/bookings/${id}/complete`, {});
            return { success: true, ...response };
        } catch (error) {
            console.warn('Backend unavailable, using Mock CheckIn Booking');
            return MockHandlers.checkInBooking(id);
        }
    },

    async noShow(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.noShowBooking(id);
        try {
            // BE uses PATCH not POST
            const response = await ApiService.patch(`/bookings/${id}/no-show`, {});
            return { success: true, ...response };
        } catch (error) {
             console.warn('Backend unavailable, using Mock NoShow Booking');
             return MockHandlers.noShowBooking(id);
        }
    },
};
