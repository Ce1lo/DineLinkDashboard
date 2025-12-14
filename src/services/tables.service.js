/**
 * Tables Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const TablesService = {
    async getList() {
        return MockHandlers.getTables();
    },

    async getById(id) {
        const result = await MockHandlers.getTables();
        return result.data.find(t => t.id === parseInt(id));
    },

    async create(data) {
        return MockHandlers.createTable(data);
    },

    async update(id, data) {
        return MockHandlers.updateTable(id, data);
    },

    async delete(id) {
        return MockHandlers.deleteTable(id);
    },

    async uploadViewImage(id, file, description = '') {
        return { success: true, message: 'Đã upload ảnh', imageUrl: '/assets/images/table-view.jpg' };
    }
};
