/**
 * Tables Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const TablesService = {
    async getList() {
        return ApiService.get('/tables');
    },

    async getById(id) {
        return ApiService.get(`/tables/${id}`);
    },

    async create(data) {
        return ApiService.post('/tables', data);
    },

    async update(id, data) {
        return ApiService.patch(`/tables/${id}`, data);
    },

    async delete(id) {
        return ApiService.delete(`/tables/${id}`);
    },

    async uploadViewImage(id, file, description = '') {
        return ApiService.upload(`/tables/${id}/view-image`, file, { description });
    }
};
