/**
 * Tables Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const TablesService = {
    async getList() {
        if (CONFIG.USE_MOCK) return MockHandlers.getTables();
        try {
            const response = await ApiService.get('/tables');
            return { data: response.data || response, success: true };
        } catch (error) {
            console.warn('Backend unavailable, using Mock Tables');
            return MockHandlers.getTables();
        }
    },

    async getById(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.getTables().then(res => res.data.find(t => t.id == id));
        try {
            const response = await ApiService.get(`/tables/${id}`);
            return response.data || response;
        } catch (error) {
            const tables = await MockHandlers.getTables();
            return tables.data.find(t => t.id == id);
        }
    },

    async create(data) {
        if (CONFIG.USE_MOCK) return MockHandlers.createTable(data);
        try {
            // Transform FE field names to match BE format
            const payload = this._transformTableData(data);
            const response = await ApiService.post('/tables', payload);
            return { success: true, ...response };
        } catch (error) {
            console.warn('Backend unavailable, using Mock Create Table');
            return MockHandlers.createTable(data);
        }
    },

    async update(id, data) {
        if (CONFIG.USE_MOCK) return MockHandlers.updateTable(id, data);
        try {
            // Transform FE field names to match BE format
            const payload = this._transformTableData(data);
            const response = await ApiService.patch(`/tables/${id}`, payload);
            return { success: true, ...response };
        } catch (error) {
            console.warn('Backend unavailable, using Mock Update Table');
            return MockHandlers.updateTable(id, data);
        }
    },

    async delete(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.deleteTable(id);
        try {
            const response = await ApiService.delete(`/tables/${id}`);
            return { success: true, ...response };
        } catch (error) {
            console.warn('Backend unavailable, using Mock Delete Table');
            return MockHandlers.deleteTable(id);
        }
    },

    async uploadViewImage(id, file, description = '') {
        if (CONFIG.USE_MOCK) return MockHandlers.uploadTableViewImage(id, file, description);
        try {
            return await ApiService.upload(`/tables/${id}/view-image`, file, { description });
        } catch (error) {
            console.warn('Backend unavailable, using Mock Upload View Image');
            return MockHandlers.uploadTableViewImage(id, file, description);
        }
    },

    /**
     * Helper: Transform table data from FE to BE format
     */
    _transformTableData(data) {
        const payload = {
            name: data.name,
            capacity: data.capacity ? parseInt(data.capacity) : undefined,
            location: data.area || data.location,
            status: data.status,
            view_image_url: data.viewImage || data.view_image_url,
            view_note: data.viewDescription || data.view_note
        };
        // Remove undefined values
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
        return payload;
    }
};
