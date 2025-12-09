/**
 * Images Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const ImagesService = {
    async getList(type = null) {
        const query = type ? `?type=${type}` : '';
        return ApiService.get(`/images${query}`);
    },

    async upload(file, type) {
        return ApiService.upload('/images', file, { type });
    },

    async delete(id) {
        return ApiService.delete(`/images/${id}`);
    },

    async setCover(id) {
        return ApiService.post(`/images/${id}/set-primary`);
    }
};
