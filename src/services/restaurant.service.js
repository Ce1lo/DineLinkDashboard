/**
 * Restaurant Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const RestaurantService = {
    async getInfo() {
        if (CONFIG.USE_MOCK) return MockHandlers.getRestaurantInfo();
        try {
            // BE endpoint: /restaurants/me
            const response = await ApiService.get('/restaurants/me');
            return response.data || response;
        } catch (error) {
             console.warn('Backend unavailable, using Mock Restaurant Info');
             return MockHandlers.getRestaurantInfo();
        }
    },

    async update(data) {
        if (CONFIG.USE_MOCK) return MockHandlers.updateRestaurant(data);
        try {
            // Transform FE field names to match BE format
            const payload = {
                name: data.name,
                address: data.address,
                phone: data.phone,
                description: data.description,
                tags: data.tags,
                require_deposit: data.requireDeposit === 'on' || data.requireDeposit === true,
                default_deposit_amount: data.defaultDeposit ? parseInt(data.defaultDeposit) : undefined
            };
            // Remove undefined values
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
            
            const response = await ApiService.patch('/restaurants/me', payload);
            return { success: true, ...response };
        } catch (error) {
            console.warn('Backend unavailable, using Mock Update Restaurant');
            return MockHandlers.updateRestaurant(data);
        }
    },

    async updateHours(hours) {
        if (CONFIG.USE_MOCK) return MockHandlers.updateRestaurantHours(hours);
        try {
            const response = await ApiService.patch('/restaurants/me', { hours });
            return { success: true, ...response };
        } catch (error) {
             console.warn('updateHours endpoint not available, using mock');
             return MockHandlers.updateRestaurantHours(hours);
        }
    },

    async updateTags(tags) {
        if (CONFIG.USE_MOCK) return MockHandlers.updateRestaurant({ tags });
        try {
            const response = await ApiService.patch('/restaurants/me', { tags });
            return { success: true, ...response };
        } catch (error) {
            console.warn('updateTags endpoint not available, using mock');
            return MockHandlers.updateRestaurant({ tags });
        }
    }
};
