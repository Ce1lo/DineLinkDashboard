/**
 * Image Loader Utility
 * Loads images with ngrok-skip-browser-warning header
 * Returns Blob URL for use in <img> tags
 */

/**
 * Fetch an image with ngrok header and return blob URL
 * @param {string} url - Image URL to fetch
 * @returns {Promise<string>} Blob URL or original URL on failure
 */
export async function loadImageWithNgrokHeader(url) {
    if (!url) return '';
    
    try {
        const response = await fetch(url, {
            headers: { 
                'ngrok-skip-browser-warning': '69420' 
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        // Check if response is actually an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            console.warn('Response is not an image:', contentType);
            return url; // Fallback
        }
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.warn('Image load failed:', url, error.message);
        return url; // Fallback to original URL
    }
}

/**
 * Load multiple images in parallel
 * @param {string[]} urls - Array of image URLs
 * @returns {Promise<string[]>} Array of Blob URLs
 */
export async function loadImagesWithNgrokHeader(urls) {
    return Promise.all(urls.map(url => loadImageWithNgrokHeader(url)));
}
