/**
 * Overview Service - PRODUCTION VERSION (ES6)
 */
import { ApiService } from './api.js';

export const OverviewService = {
    async getOverview() {
        return ApiService.get('/overview');
    }
};
