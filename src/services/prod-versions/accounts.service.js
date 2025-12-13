/**
 * Accounts Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const AccountsService = {
    async getPending() {
        return ApiService.get('/accounts/pending');
    },

    async getList() {
        return ApiService.get('/accounts');
    },

    async getById(id) {
        return ApiService.get(`/accounts/${id}`);
    },

    async approve(id) {
        return ApiService.post(`/accounts/${id}/approve`);
    },

    async reject(id, reason = '') {
        return ApiService.post(`/accounts/${id}/reject`, { reason });
    },

    async updateStatus(id, status) {
        return ApiService.patch(`/accounts/${id}/status`, { status });
    },

    async deactivate(id) {
        return this.updateStatus(id, 'INACTIVE');
    },

    async activate(id) {
        return this.updateStatus(id, 'ACTIVE');
    },

    async changeRole(id, role) {
        return ApiService.patch(`/accounts/${id}/role`, { role });
    }
};
