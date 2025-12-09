/**
 * Reviews Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const ReviewsService = {
    async getList(params = {}) {
        const query = new URLSearchParams(params).toString();
        return ApiService.get(`/reviews${query ? '?' + query : ''}`);
    },

    async reply(id, reply) {
        return ApiService.post(`/reviews/${id}/reply`, { reply });
    },

    async hide(id) {
        return ApiService.post(`/reviews/${id}/hide`);
    },

    async show(id) {
        return ApiService.post(`/reviews/${id}/show`);
    }
};
