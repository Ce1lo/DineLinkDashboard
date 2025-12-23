/**
 * Restaurant Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const RestaurantService = {
    async getInfo() {
        // BE endpoint: /restaurants/me
        const response = await ApiService.get('/restaurants/me');
        return response.data || response;
    },

    async update(data) {
        // Helper: normalize time to HH:mm format (strip seconds)
        const normalizeTime = (time) => {
            if (!time) return undefined;
            // If format is HH:mm:ss, take only HH:mm
            return time.length > 5 ? time.substring(0, 5) : time;
        };

        // Transform FE field names to match BE format
        const payload = {
            name: data.name,
            address: data.address,
            phone: data.phone,
            description: data.description,
            tags: data.tags,
            open_time: normalizeTime(data.open_time),
            close_time: normalizeTime(data.close_time),
            require_deposit: data.requireDeposit === 'on' || data.requireDeposit === true,
            default_deposit_amount: data.defaultDeposit ? parseInt(data.defaultDeposit) : undefined
        };
        // Remove undefined values
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
        
        const response = await ApiService.patch('/restaurants/me', payload);
        return { success: true, ...response };
    },

    async updateHours(hours) {
        // BE might not have this endpoint yet - handle gracefully
        try {
            const response = await ApiService.patch('/restaurants/me', { hours });
            return { success: true, ...response };
        } catch (error) {
            console.warn('updateHours endpoint not available');
            return { success: false, message: 'Endpoint not available' };
        }
    },

    async updateTags(tags) {
        try {
            const response = await ApiService.patch('/restaurants/me', { tags });
            return { success: true, ...response };
        } catch (error) {
            console.warn('updateTags endpoint not available');
            return { success: false, message: 'Endpoint not available' };
        }
    }
};
