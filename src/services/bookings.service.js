/**
 * Bookings Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const BookingsService = {
    async getList(params = {}) {
        return MockHandlers.getBookings(params);
    },

    async getById(id) {
        const result = await MockHandlers.getBookings();
        return result.data.find(b => b.id === parseInt(id));
    },

    async confirm(id) {
        return MockHandlers.confirmBooking(id);
    },

    async cancel(id) {
        return MockHandlers.cancelBooking(id);
    },

    async assignTable(id, tableId) {
        return MockHandlers.assignTable(id, tableId);
    },

    async checkIn(id) {
        return MockHandlers.checkInBooking(id);
    },

    async noShow(id) {
        return MockHandlers.noShowBooking(id);
    }
};
