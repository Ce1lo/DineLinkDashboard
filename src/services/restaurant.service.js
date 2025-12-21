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
        // Transform FE field names to match BE format
        const payload = {
            name: data.name,
            address: data.address,
            phone: data.phone,
            description: data.description,
            tags: data.tags,
            open_time: data.open_time,
            close_time: data.close_time,
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
