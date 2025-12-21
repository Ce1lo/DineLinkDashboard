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
            // Primary: Use dedicated endpoint
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            
            const endpoint = `/restaurant-images?${params.toString()}`;
            const response = await ApiService.get(endpoint);
            
            
            if (response.success && response.data) {
                const items = response.data.items || [];
                return { 
                    data: items, 
                    success: true 
                };
            }
            return { data: [], success: false };
        } catch (error) {
            console.warn('Primary images endpoint failed, trying fallback:', error.message);
            
            // Fallback: Get images from RestaurantService.getInfo()
            try {
                const result = await RestaurantService.getInfo();
                const restaurant = result.data || result;
                const images = restaurant.images || [];
                
                if (!type) return { data: images, success: true };
                
                const filtered = images.filter(img => img.type === type);
                return { data: filtered, success: true };
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                return { data: [], success: false };
            }
        }
    },

    async upload(formData, type) {
        // API docs: 
        // Single: POST /api/v1/dashboard/uploads/images/restaurants/cover
        // Multiple: POST /api/v1/dashboard/uploads/images/restaurants/galleries
        // Multiple: POST /api/v1/dashboard/uploads/images/restaurants/menus

        let endpoint = '/uploads/images/restaurants/galleries'; // default multiple
        let isMultiple = true;
        
        if (type === 'COVER') {
            endpoint = '/uploads/images/restaurants/cover';
            isMultiple = false;
        } else if (type === 'MENU') {
            endpoint = '/uploads/images/restaurants/menus';
            isMultiple = true;
        } else if (type === 'GALLERY') {
            endpoint = '/uploads/images/restaurants/galleries';
            isMultiple = true;
        }
        
        // Handle 'file' vs 'files' field names
        // FE View passes 'file' (from input name="file")
        // But for multiple, we need 'files'
        
        // If multiple files selected, input name="file" might contain multiple
        // We need to reconstruct FormData if renaming is needed or just rely on input
        
        // However, the View just passes `new FormData(form)`.
        // The input name is "file".
        // If we want "files", we might need to append them manually if we can't rename in FormData easily without iteration.
        
        // Let's create a new FormData to be safe and clear
        const newFormData = new FormData();
        
        // Append other fields if any (like type, though usually not needed for upload endpoint itself if encoded in URL/Endpoint)
        // BE endpoints don't seem to need 'type' body field, they are specific endpoints.
        
        const fileInput = formData.getAll('file'); // getAll returns array of values
        if (isMultiple) {
             fileInput.forEach(file => {
                 if (file instanceof File) {
                     newFormData.append('files', file);
                 }
             });
        } else {
            // Single file for COVER
            const file = formData.get('file');
            if (file instanceof File) {
                newFormData.append('file', file);
            }
        }
        
        const response = await ApiService.post(endpoint, newFormData);
        
        // API documentation requires 2 steps:
        // 1. Upload file to get path
        // 2. POST /api/v1/dashboard/restaurant-images with path to create record
        
        if (response.success && response.data) {
            // response.data can be array (multiple) or object (single)
            const uploadedFiles = Array.isArray(response.data) ? response.data : [response.data];
            
            try {
                const createPromises = uploadedFiles.map(fileData => {
                    const payload = {
                        file_path: fileData.path,
                        type: type,
                        caption: fileData.originalName || '',
                        is_primary: type === 'COVER' 
                    };
                    return this.create(payload);
                });
                
                const createResults = await Promise.all(createPromises);
                
                // Return created images (Step 2 result) so UI can display them immediately
                // createResults is array of responses: [{success: true, data: {...}}, ...]
                const createdImages = createResults
                    .filter(res => res && res.success)
                    .map(res => res.data);

                return {
                    success: true,
                    data: createdImages, // This is now the list of created DB records
                    originalUploadResponse: response
                };
            } catch (createError) {
                console.warn('Failed to create image records:', createError);
                return { success: true, data: [], warning: 'Upload ok but failed to create record' };
            }
        }
        
        return response; // Fallback if no data
    },

    async create(data) {
        // API docs: POST /api/v1/dashboard/restaurant-images
        return ApiService.post('/restaurant-images', data);
    },

    async delete(id) {
        // API docs: DELETE /api/v1/dashboard/restaurant-images/:id
        const response = await ApiService.delete(`/restaurant-images/${id}`);
        return { success: true, ...response };
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
