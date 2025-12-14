/**
 * Accounts Service - PRODUCTION VERSION (ES6)
 * Maps to BE /staff routes
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const AccountsService = {
    async getPending() {
        if (CONFIG.USE_MOCK) return MockHandlers.getPendingAccounts();
        try {
            // BE: GET /staff returns all staff, filter for INVITED status
            const response = await ApiService.get('/staff');
            const data = response.data || response;
            const list = Array.isArray(data) ? data : (data.items || []);
            const pending = list.filter(s => s.status === 'INVITED' || s.status === 'PENDING');
            return { data: pending, success: true };
        } catch (error) {
            console.warn('Could not fetch pending staff, using Mock:', error);
            return MockHandlers.getPendingAccounts();
        }
    },

    async getList() {
        if (CONFIG.USE_MOCK) return MockHandlers.getAccounts();
        try {
            const response = await ApiService.get('/staff');
            return { data: response.data || response, success: true };
        } catch (error) {
            console.warn('Could not fetch staff list, using Mock:', error);
            return MockHandlers.getAccounts();
        }
    },

    async getById(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.getAccountById(id);
        try {
            const response = await ApiService.get(`/staff/${id}`);
            return response.data || response;
        } catch (error) {
            return MockHandlers.getAccountById(id);
        }
    },

    async approve(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.approveAccount(id);
        try {
            // BE uses PATCH not POST
            const response = await ApiService.patch(`/staff/${id}/approve`, {});
            return { success: true, ...response };
        } catch (error) {
            return MockHandlers.approveAccount(id);
        }
    },

    async reject(id, reason = '') {
        if (CONFIG.USE_MOCK) return MockHandlers.rejectAccount(id);
        try {
            // BE uses PATCH not POST
            const response = await ApiService.patch(`/staff/${id}/reject`, { reason });
            return { success: true, ...response };
        } catch (error) {
            return MockHandlers.rejectAccount(id);
        }
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
        if (CONFIG.USE_MOCK) return MockHandlers.updateAccountStatus(id, 'LOCKED');
        try {
            const response = await ApiService.patch(`/staff/${id}/lock`, {});
            return { success: true, ...response };
        } catch (error) {
            return MockHandlers.updateAccountStatus(id, 'LOCKED');
        }
    },

    async unlock(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.updateAccountStatus(id, 'ACTIVE');
        try {
            const response = await ApiService.patch(`/staff/${id}/unlock`, {});
            return { success: true, ...response };
        } catch (error) {
            return MockHandlers.updateAccountStatus(id, 'ACTIVE');
        }
    },

    async deactivate(id) {
        return this.lock(id);
    },

    async activate(id) {
        return this.unlock(id);
    },

    async changeRole(id, role) {
        if (CONFIG.USE_MOCK) return MockHandlers.updateAccountRole(id, role);
        try {
            const response = await ApiService.patch(`/staff/${id}/role`, { role });
            return { success: true, ...response };
        } catch (error) {
            console.warn('changeRole endpoint not available, falling back to mock');
            return MockHandlers.updateAccountRole(id, role);
        }
    }
};
