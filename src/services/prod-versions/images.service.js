/**
 * ImagesService - PRODUCTION VERSION (ES6)
 * Handles image management by interacting with RestaurantService (for list/update)
 * and Upload endpoints.
 */
import { ApiService } from './api.js';
import { RestaurantService } from './restaurant.service.js';

export const ImagesService = {
    /**
     * Get images filtered by type (COVER, GALLERY, MENU)
     * Fetches from RestaurantService.getInfo()
     */
    async getList(type = null) {
        try {
            const result = await RestaurantService.getInfo();
            const restaurant = result.data || result;
            const images = restaurant.images || [];
            
            if (!type) return { data: images, success: true };
            
            const filtered = images.filter(img => img.type === type);
            return { data: filtered, success: true };
        } catch (error) {
            console.warn('Error fetching images:', error);
            return { data: [], success: false };
        }
    },

    async upload(formData, type) {
        // Map type to BE endpoint scope
        // Upload routes: /uploads/images/restaurants/cover, /gallery, /menu
        let endpoint = '/uploads/images/restaurants/gallery'; // default
        
        if (type === 'COVER') endpoint = '/uploads/images/restaurants/cover';
        else if (type === 'MENU') endpoint = '/uploads/images/restaurants/menu';
        else if (type === 'GALLERY') endpoint = '/uploads/images/restaurants/gallery';
        
        // Note: formData should contain 'image' field as per BE controller expectations?
        // BE controller: uploadSingleImageMiddleware expects field 'image' (usually dflt) or req.file
        // FE ImagesView passes formData directly.
        
        return ApiService.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    async delete(id) {
        console.warn('Delete image not fully implemented in BE yet.');
        // TODO: Call BE endpoint to delete image record if available
        return { success: false, message: 'Tính năng xóa chưa được hỗ trợ bởi BE' };
    },

    async setCover(id) {
        // Find image URL then update restaurant main_image_url
        try {
            const listRes = await this.getList();
            const images = listRes.data || [];
            const target = images.find(img => img.id == id || img.id === id); // loose match
            
            if (!target) return { success: false, message: 'Image not found' };
            
            return RestaurantService.update({
                main_image_url: target.file_path
            });
        } catch (error) {
            console.error('Error setting cover:', error);
            return { success: false, message: 'Failed to set cover' };
        }
    }
};
