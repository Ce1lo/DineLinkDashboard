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

/**
 * Fix all images on the page that have ngrok URLs
 * Replaces img src with blob URLs fetched with ngrok header
 * Call after page render to fix avatar and other images
 */
export async function fixNgrokImages() {
    // Find all images that may need ngrok header:
    // - ngrok URLs, /uploads/ paths, sidebar-avatar class
    const images = document.querySelectorAll('img[src*=\"ngrok\"], img[src*=\"pyramidally\"], img[src*=\"/uploads/\"], img.sidebar-avatar');
    
    const fixPromises = Array.from(images).map(async (img) => {
        if (img.dataset.ngrokFixed) return; // Already fixed
        
        const originalSrc = img.src;
        try {
            const blobUrl = await loadImageWithNgrokHeader(originalSrc);
            if (blobUrl !== originalSrc) {
                img.src = blobUrl;
                img.dataset.ngrokFixed = 'true';
            }
        } catch (e) {
            console.warn('Failed to fix image:', originalSrc);
        }
    });
    
    await Promise.all(fixPromises);
}
