/**
 * Images Service - MOCK VERSION (ES6)
 */
import { MockHandlers } from '../mock/handlers.js';

export const ImagesService = {
    async getList(type = null) {
        return MockHandlers.getImages(type);
    },

    async upload(file, type) {
        return MockHandlers.uploadImage(file, type);
    },

    async delete(id) {
        return MockHandlers.deleteImage(id);
    },

    async setCover(id) {
        return MockHandlers.setPrimaryImage(id);
    }
};
