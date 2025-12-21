/**
 * Images View
 * Xử lý logic render và sự kiện cho trang Quản lý hình ảnh
 */
import { ImagesService } from '../services/images.service.js';
import { AuthService } from '../services/auth.service.js';
import { CONFIG } from '../config.js';

export const ImagesView = {
    async render(App) {
        const [cover, gallery, menu] = await Promise.all([
            ImagesService.getList('COVER'),
            ImagesService.getList('GALLERY'),
            ImagesService.getList('MENU')
        ]);
        
        // Pass isOwner flag to template for role-based UI
        const isOwner = AuthService.isOwner();
        
        // Helper to normalize image URLs
        const normalizeImages = (images) => {
            if (!images || !Array.isArray(images)) return [];
            return images.map(img => ({
                ...img,
                url: img.file_path && img.file_path.startsWith('http') 
                     ? img.file_path 
                     : `${CONFIG.API_BASE_URL}${img.file_path}`
            }));
        };

        const normalizedData = { 
            cover: normalizeImages(cover.data), 
            gallery: normalizeImages(gallery.data), 
            menu: normalizeImages(menu.data),
            isOwner
        };

        await App.renderPage('images', normalizedData, true);
        this.bindEvents(App);
    },

    bindEvents(App) {
        window.switchTab = function(tab) {
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active', 'border-primary-500', 'text-primary-600');
                b.classList.add('border-transparent', 'text-stone-500');
            });
            const panel = document.getElementById(tab + '-panel');
            if (panel) panel.classList.remove('hidden');
            const btn = document.getElementById(tab + '-tab');
            if (btn) {
                btn.classList.add('active', 'border-primary-500', 'text-primary-600');
                btn.classList.remove('border-transparent', 'text-stone-500');
            }
        };
        
        // Use Event Delegation for robust button handling
        // This catches clicks on any element with data-action="uploadImage", 
        // even if initialized later or in empty states.
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="uploadImage"]');
            if (btn) {
                e.preventDefault();
                e.stopPropagation(); // Stop bubbling
                
                const type = btn.dataset.type;
                const fileInput = document.getElementById('imageFile');
                
                // Set hidden type input
                const typeInput = document.getElementById('uploadImageType');
                if (typeInput) typeInput.value = type;
                
                // Reset form and preview explicitly
                const form = document.getElementById('uploadImageForm');
                if (form) form.reset();
                
                const preview = document.getElementById('imagePreview');
                if (preview) preview.innerHTML = '';
                
                if (fileInput) fileInput.value = ''; // Force clear value
                
                // Toggle multiple attribute based on type
                if (fileInput) {
                    if (type === 'COVER') {
                        fileInput.removeAttribute('multiple');
                    } else {
                        fileInput.setAttribute('multiple', 'multiple');
                    }
                }
                
                // Open Modal - ensure openModal exists globally or import it? 
                // Assuming window.openModal is available as per user context
                if (window.openModal) {
                    window.openModal('uploadImageModal');
                } else {
                    // Fallback if global helper missing
                    const modal = document.getElementById('uploadImageModal');
                    if (modal) {
                         modal.classList.remove('hidden');
                         const backdrop = document.querySelector('.modal-backdrop');
                         if(backdrop) backdrop.classList.add('show');
                    }
                }
            }
        });

        const uploadForm = document.getElementById('uploadImageForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUpload(uploadForm, App);
            });
        }

        const fileInput = document.getElementById('imageFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                 // Handle multiple files
                 if (e.target.files && e.target.files.length > 0) {
                     this.previewImages(e.target.files);
                 }
            });
        }

        // Event Delegation for DELETE buttons (works for dynamically added buttons)
        document.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('[data-action="deleteImage"]');
            if (deleteBtn) {
                e.stopPropagation();
                const imageId = deleteBtn.dataset.id;
                await this.handleDelete(imageId, App);
            }
        });

        // Event Delegation for setPrimary buttons
        document.addEventListener('click', async (e) => {
            const primaryBtn = e.target.closest('[data-action="setPrimary"]');
            if (primaryBtn) {
                e.stopPropagation();
                const imageId = primaryBtn.dataset.id;
                await this.handleSetCover(imageId, App);
            }
        });
    },

    async handleUpload(form, App) {
        const formData = new FormData(form);
        const type = formData.get('type');
        
        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await ImagesService.upload(formData, type);
            
            if (result.success) {
                App.showSuccess('Upload ảnh thành công!');
                window.closeModal('uploadImageModal');
                
                // Optimistic UI Update: Display new images immediately without reloading
                // result.data contains the list of created image records (from Step 2)
                const newImages = result.data || [];
                
                if (newImages.length > 0) {
                    // Logic to append to DOM based on type
                    if (type === 'COVER') {
                        const fullUrl = newImages[0].file_path.startsWith('http') 
                            ? newImages[0].file_path 
                            : `${CONFIG.API_BASE_URL}${newImages[0].file_path}`;
                        
                        // Try to update existing image first
                        let coverImg = document.querySelector('#cover-panel img');
                        
                        if (coverImg) {
                            coverImg.src = fullUrl;
                        } else {
                            // Empty State: Replace with image container
                            const panelBody = document.querySelector('#cover-panel .p-6');
                            const emptyState = panelBody?.querySelector('.empty-state');
                            if (emptyState) emptyState.remove();
                            
                            // Create new cover image container
                            const imgContainer = document.createElement('div');
                            imgContainer.className = 'relative rounded-xl overflow-hidden';
                            imgContainer.innerHTML = `
                                <img src="${fullUrl}" alt="Cover" class="w-full max-h-96 object-cover">
                                <div class="absolute bottom-4 right-4 flex gap-2">
                                    <button class="btn btn-sm bg-white/80 backdrop-blur-sm" data-action="deleteImage" data-id="${newImages[0].id}">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            `;
                            panelBody?.appendChild(imgContainer);
                        }
                    } else {
                        // GALLERY or MENU -> Append to grid
                        const panelId = type === 'GALLERY' ? 'gallery-panel' : 'menu-panel';
                        let grid = document.querySelector(`#${panelId} .grid`);
                        
                        // Handle Empty State: If grid doesn't exist, remove empty-state and create grid
                        if (!grid) {
                            const panelBody = document.querySelector(`#${panelId} .p-6`);
                            const emptyState = panelBody.querySelector('.empty-state');
                            if (emptyState) emptyState.remove();
                            
                            grid = document.createElement('div');
                            grid.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
                            panelBody.appendChild(grid);
                        }
                        
                        if (grid) {
                            newImages.forEach(img => {
                                const fullUrl = img.file_path.startsWith('http') 
                                    ? img.file_path 
                                    : `${CONFIG.API_BASE_URL}${img.file_path}`;
                                    
                                const div = document.createElement('div');
                                div.className = type === 'GALLERY' 
                                    ? 'group relative rounded-xl overflow-hidden aspect-square'
                                    : 'group relative rounded-xl overflow-hidden';
                                if (type === 'MENU') div.style.aspectRatio = '3/4';
                                
                                div.innerHTML = `
                                    <img src="${fullUrl}" alt="${type}" class="w-full h-full object-cover">
                                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        ${type === 'GALLERY' ? `
                                        <button class="btn btn-icon bg-white/80" data-action="setPrimary" data-id="${img.id}" title="Đặt làm cover">
                                            <i class="fa-solid fa-star"></i>
                                        </button>` : ''}
                                        <button class="btn btn-icon bg-white/80" data-action="deleteImage" data-id="${img.id}" title="Xoá">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                `;
                                grid.appendChild(div);
                            });
                        } else {
                            // Should not happen if logic above works
                             App.reload();
                        }
                    }
                } else {
                     // Fallback if no data returned
                     App.reload();
                }
            }
        } catch (error) {
            console.error('Upload Error:', error);
            App.showError(error.message || 'Upload ảnh thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    previewImages(files) {
        const previewContainer = document.getElementById('imagePreview');
        if (previewContainer) {
            previewContainer.innerHTML = ''; // Clear previous
            previewContainer.className = 'grid grid-cols-3 gap-2 mt-4'; // Add grid layout
            
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.className = 'relative aspect-square';
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" 
                             class="w-full h-full object-cover rounded-lg border border-stone-200">
                    `;
                    previewContainer.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
        }
    },

    async handleDelete(imageId, App) {
        if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;
        try {
            const result = await ImagesService.delete(imageId);
            if (result.success) {
                App.showSuccess('Xóa ảnh thành công!');
                App.reload();
            }
        } catch (error) {
            App.showError('Xóa ảnh thất bại. Vui lòng thử lại.');
        }
    },

    async handleSetCover(imageId, App) {
        try {
            const result = await ImagesService.setCover(imageId);
            if (result.success) {
                App.showSuccess('Đã đặt làm ảnh bìa!');
                App.reload();
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
};
