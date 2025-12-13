/**
 * Accounts Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const AccountsService = {
    async getPending() {
        return MockHandlers.getPendingAccounts();
    },

    async getList(params) {
        return MockHandlers.getAccounts(params);
    },

    async getById(id) {
        return MockHandlers.getAccountById(id);
    },

    async approve(id) {
        return MockHandlers.approveAccount(id);
    },

    async reject(id, reason = '') {
        return MockHandlers.rejectAccount(id);
    },

    async updateStatus(id, status) {
        return MockHandlers.updateAccountStatus(id, status);
    },

    async deactivate(id) {
        return this.updateStatus(id, 'INACTIVE');
    },

    async activate(id) {
        return this.updateStatus(id, 'ACTIVE');
    },

    async changeRole(id, role) {
        return MockHandlers.updateAccountRole(id, role);
    }
};
