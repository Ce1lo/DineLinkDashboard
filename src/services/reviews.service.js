/**
 * Reviews Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const ReviewsService = {
    async getList(params = {}) {
        if (CONFIG.USE_MOCK) return MockHandlers.getReviews(params);
        try {
            const query = new URLSearchParams(params).toString();
            const response = await ApiService.get(`/reviews${query ? '?' + query : ''}`);
            return { data: response.data || response, success: true };
        } catch (error) {
            console.warn('Could not fetch reviews, using Mock:', error);
            return MockHandlers.getReviews(params);
        }
    },

    async getById(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.getReviewById(id);
        try {
            const response = await ApiService.get(`/reviews/${id}`);
            return response.data || response;
        } catch (error) {
            return MockHandlers.getReviewById(id);
        }
    },

    async reply(id, reply) {
        if (CONFIG.USE_MOCK) return MockHandlers.replyReview(id, reply);
        try {
            // BE uses PATCH and expects 'comment' field, not 'reply'
            const response = await ApiService.patch(`/reviews/${id}/reply`, { comment: reply });
            return { success: true, ...response };
        } catch (error) {
            return MockHandlers.replyReview(id, reply);
        }
    },

    async hide(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.hideReview(id);
        try {
            const response = await ApiService.patch(`/reviews/${id}/hide`, {});
            return { success: true, ...response };
        } catch (error) {
            console.warn('hide endpoint not available, falling back to mock');
            return MockHandlers.hideReview(id);
        }
    },

    async show(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.showReview(id);
        try {
            const response = await ApiService.patch(`/reviews/${id}/show`, {});
            return { success: true, ...response };
        } catch (error) {
            console.warn('show endpoint not available, falling back to mock');
            return MockHandlers.showReview(id);
        }
    }
};
