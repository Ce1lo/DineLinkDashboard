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

    async uploadViewImage(tableId, file) {
        // API docs: POST /api/v1/dashboard/uploads/images/tables/view?table_id=X
        // Field name: 'file'
        const formData = new FormData();
        formData.append('file', file);
        const response = await ApiService.post(`/uploads/images/tables/view?table_id=${tableId}`, formData);
        
        // Step 2: Update table record with the uploaded image path
        // Wrapped in try-catch to not break flow if PATCH fails
        if (response.success && response.data?.path) {
            try {
                await this.update(tableId, { view_image_url: response.data.path });
            } catch (updateError) {
                console.warn('Failed to update table with image path:', updateError.message);
                // Still return success since file was uploaded
            }
        }
        
        return response;
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
