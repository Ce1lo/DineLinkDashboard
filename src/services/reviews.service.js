/**
 * Reviews Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const ReviewsService = {
    async getList(params = {}) {
        return MockHandlers.getReviews(params);
    },

    async reply(id, reply) {
        return MockHandlers.replyReview(id, reply);
    },

    async hide(id) {
        return MockHandlers.hideReview(id);
    },

    async show(id) {
        return MockHandlers.showReview(id);
    }
};
