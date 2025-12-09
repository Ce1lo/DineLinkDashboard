/**
 * Overview Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const OverviewService = {
    async getOverview() {
        return MockHandlers.getOverview();
    }
};
