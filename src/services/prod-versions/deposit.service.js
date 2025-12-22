// src/services/deposit.service.js

/**
 * Deposit Service – interacts with backend endpoint for deposit settings.
 * Uses RestaurantService under the hood because the backend exposes
 * `/restaurants/me` for both general info and deposit updates.
 */
import { ApiService } from './api.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';
import { RestaurantService } from './restaurant.service.js';

export const DepositService = {
  /**
   * Fetch current deposit settings.
   * Returns an object: { requireDeposit: boolean, defaultDepositAmount: number }
   */
  async getSettings() {
    const data = await RestaurantService.getInfo();
    // Backend may return snake_case; normalize to camelCase for the UI.
    const payload = data && data.data ? data.data : data;
    return {
      requireDeposit: payload.require_deposit ?? payload.requireDeposit ?? false,
      defaultDepositAmount: payload.default_deposit_amount ?? payload.defaultDeposit ?? 0,
    };
  },

  /**
   * Update deposit settings.
   * @param {{ requireDeposit: boolean, defaultDepositAmount: number }} settings
   * @returns {Promise<any>} result
   */
  async updateSettings(settings) {
    if (CONFIG.USE_MOCK) {
       // Mock handler expects snake_case in data object
       return MockHandlers.updateRestaurant({
         require_deposit: !!settings.requireDeposit,
         default_deposit_amount: Number(settings.defaultDepositAmount) || 0
       });
    }

    const payload = {
      require_deposit: !!settings.requireDeposit,
      default_deposit_amount: Number(settings.defaultDepositAmount) || 0,
    };
    
    try {
        const response = await ApiService.patch('/restaurants/me', payload);
        return { success: true, ...response };
    } catch (error) {
        console.warn('Backend unavailable, using Mock for Deposit Update');
        return MockHandlers.updateRestaurant(payload);
    }
  },
};
