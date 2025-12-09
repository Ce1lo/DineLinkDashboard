/**
 * Restaurant Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const RestaurantService = {
    async getInfo() {
        return ApiService.get('/restaurant');
    },

    async update(data) {
        return ApiService.patch('/restaurant', data);
    }
};
