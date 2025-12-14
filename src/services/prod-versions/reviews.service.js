/**
 * Reviews Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const ReviewsService = {
    async getList(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await ApiService.get(`/reviews${query ? '?' + query : ''}`);
            return { data: response.data || response, success: true };
        } catch (error) {
            console.warn('Could not fetch reviews:', error);
            return { data: [], success: false };
        }
    },

    async getById(id) {
        const response = await ApiService.get(`/reviews/${id}`);
        return response.data || response;
    },

    async reply(id, reply) {
        // BE uses PATCH and expects 'comment' field, not 'reply'
        const response = await ApiService.patch(`/reviews/${id}/reply`, { comment: reply });
        return { success: true, ...response };
    },

    async hide(id) {
        // BE might not have this endpoint yet
        try {
            const response = await ApiService.patch(`/reviews/${id}/hide`, {});
            return { success: true, ...response };
        } catch (error) {
            console.warn('hide endpoint not available');
            return { success: false, message: 'Endpoint not available' };
        }
    },

    async show(id) {
        // BE might not have this endpoint yet
        try {
            const response = await ApiService.patch(`/reviews/${id}/show`, {});
            return { success: true, ...response };
        } catch (error) {
            console.warn('show endpoint not available');
            return { success: false, message: 'Endpoint not available' };
        }
    }
};
