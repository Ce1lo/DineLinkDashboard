/**
 * Restaurant Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const RestaurantService = {
    async getInfo() {
        return MockHandlers.getRestaurantInfo();
    },

    async update(data) {
        return MockHandlers.updateRestaurant(data);
    }
};
