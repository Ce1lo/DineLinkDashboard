/**
 * Accounts Service - PRODUCTION VERSION (ES6)
 * Maps to BE /staff routes
 */
import { ApiService } from './api.js';

export const AccountsService = {
    async getPending() {
        try {
            // BE: GET /staff returns all staff, filter for INVITED status
            const response = await ApiService.get('/staff');
            const data = response.data || response;
            const list = Array.isArray(data) ? data : (data.items || []);
            const pending = list.filter(s => s.status === 'INVITED' || s.status === 'PENDING');
            return { data: pending, success: true };
        } catch (error) {
            console.warn('Could not fetch pending staff:', error);
            return { data: [], success: false };
        }
    },

    async getList() {
        try {
            const response = await ApiService.get('/staff');
            return { data: response.data || response, success: true };
        } catch (error) {
            console.warn('Could not fetch staff list:', error);
            return { data: [], success: false };
        }
    },

    async getById(id) {
        const response = await ApiService.get(`/staff/${id}`);
        return response.data || response;
    },

    async approve(id) {
        // BE uses PATCH not POST
        const response = await ApiService.patch(`/staff/${id}/approve`, {});
        return { success: true, ...response };
    },

    async reject(id, reason = '') {
        // BE uses PATCH not POST
        const response = await ApiService.patch(`/staff/${id}/reject`, { reason });
        return { success: true, ...response };
    },

    async updateStatus(id, status) {
        // Map to lock/unlock endpoints
        if (status === 'INACTIVE' || status === 'LOCKED') {
            return this.lock(id);
        } else {
            return this.unlock(id);
        }
    },

    async lock(id) {
        const response = await ApiService.patch(`/staff/${id}/lock`, {});
        return { success: true, ...response };
    },

    async unlock(id) {
        const response = await ApiService.patch(`/staff/${id}/unlock`, {});
        return { success: true, ...response };
    },

    async deactivate(id) {
        return this.lock(id);
    },

    async activate(id) {
        return this.unlock(id);
    },

    async changeRole(id, role) {
        // BE might not have this endpoint yet
        try {
            const response = await ApiService.patch(`/staff/${id}/role`, { role });
            return { success: true, ...response };
        } catch (error) {
            console.warn('changeRole endpoint not available');
            return { success: false, message: 'Endpoint not available' };
        }
    }
};
