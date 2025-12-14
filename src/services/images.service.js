/**
 * ImagesService - PRODUCTION VERSION (ES6)
 * Handles image management by interacting with RestaurantService (for list/update)
 * and Upload endpoints.
 */
import { ApiService } from './api.js';
import { RestaurantService } from './restaurant.service.js';
import { CONFIG } from '../config.js';
import { MockHandlers } from '../mock/handlers.js';

export const ImagesService = {
    /**
     * Get images filtered by type (COVER, GALLERY, MENU)
     * Fetches from RestaurantService.getInfo()
     */
    async getList(type = null) {
        if (CONFIG.USE_MOCK) return MockHandlers.getImages(type);

        try {
            const result = await RestaurantService.getInfo();
            const restaurant = result.data || result;
            const images = restaurant.images || [];
            
            if (!type) return { data: images, success: true };
            
            const filtered = images.filter(img => img.type === type);
            return { data: filtered, success: true };
        } catch (error) {
            console.warn('Fetch images failed, fallback to Mock');
            return MockHandlers.getImages(type);
        }
    },

    async upload(formData, type) {
        if (CONFIG.USE_MOCK) return MockHandlers.uploadImage(null, type);

        try {
            // Map type to BE endpoint scope
            // Upload routes: /uploads/images/restaurants/cover, /gallery, /menu
            let endpoint = '/uploads/images/restaurants/gallery'; // default
            
            if (type === 'COVER') endpoint = '/uploads/images/restaurants/cover';
            else if (type === 'MENU') endpoint = '/uploads/images/restaurants/menu';
            else if (type === 'GALLERY') endpoint = '/uploads/images/restaurants/gallery';
            
            return await ApiService.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            return MockHandlers.uploadImage(null, type);
        }
    },

    async delete(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.deleteImage(id);
        
        try {
             return { success: false, message: 'Tính năng xóa chưa được hỗ trợ bởi BE' };
        } catch (error) {
            return MockHandlers.deleteImage(id);
        }
    },

    async setCover(id) {
        if (CONFIG.USE_MOCK) return MockHandlers.setPrimaryImage(id);

        try {
            const listRes = await this.getList();
            const images = listRes.data || [];
            const target = images.find(img => img.id == id || img.id === id); // loose match
            
            if (!target) return { success: false, message: 'Image not found' };
            
            return await RestaurantService.update({
                main_image_url: target.file_path
            });
        } catch (error) {
            console.warn('Set cover failed, fallback to Mock');
            return MockHandlers.setPrimaryImage(id);
        }
    }
};
