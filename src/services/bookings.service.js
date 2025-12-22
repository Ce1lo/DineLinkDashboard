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

    /**
     * Search bookings by keyword (customer name, phone, booking code)
     * API: GET /bookings/search?q=
     */
    async search(query, limit = 5) {
        const params = new URLSearchParams({ q: query, limit }).toString();
        const response = await ApiService.get(`/bookings/search?${params}`);
        return { data: response.data || response, success: true };
    },

    async getById(id) {
        try {
            const response = await ApiService.get(`/bookings/${id}`);
            const booking = response.data || response;
            
            if (booking) {
                // Map BE fields (snake_case) to FE expected fields (camelCase)
                return {
                    id: booking.id,
                    code: booking.code || `BK-${booking.id}`,
                    customerName: booking.customer_name || booking.user?.display_name || booking.user?.name || 'N/A',
                    customerPhone: booking.phone || booking.user?.phone || 'N/A',
                    guests: booking.people_count || booking.guests,
                    datetime: booking.booking_time || booking.datetime,
                    status: booking.status,
                    tableId: booking.table_id,
                    tableName: booking.table?.name || (booking.table_id ? `Bàn ${booking.table_id}` : 'Chưa gán'),
                    deposit: booking.deposit_amount || booking.deposit || 0,
                    paymentStatus: booking.payment_status,
                    notes: booking.note || booking.notes || '',
                    createdAt: booking.created_at
                };
            }
            return null;
        } catch (error) {
            console.warn('Could not fetch booking by id:', error);
            return null;
        }
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
