/**
 * Tables Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const TablesService = {
    async getList() {
        const response = await ApiService.get('/tables');
        return { data: response.data || response, success: true };
    },

    async getById(id) {
        const response = await ApiService.get(`/tables/${id}`);
        return response.data || response;
    },

    async create(data) {
        // Transform FE field names to match BE format
        const payload = this._transformTableData(data);
        const response = await ApiService.post('/tables', payload);
        return { success: true, ...response };
    },

    async update(id, data) {
        // Transform FE field names to match BE format
        const payload = this._transformTableData(data);
        const response = await ApiService.patch(`/tables/${id}`, payload);
        return { success: true, ...response };
    },

    async delete(id) {
        const response = await ApiService.delete(`/tables/${id}`);
        return { success: true, ...response };
    },

    async uploadViewImage(id, file, description = '') {
        return ApiService.upload(`/tables/${id}/view-image`, file, { description });
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
