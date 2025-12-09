/**
 * Images View
 * Xử lý logic render và sự kiện cho trang Quản lý hình ảnh
 */
import { ImagesService } from '../services/images.service.js';

export const ImagesView = {
    async render(App) {
        const [cover, gallery, menu] = await Promise.all([
            ImagesService.getList('COVER'),
            ImagesService.getList('GALLERY'),
            ImagesService.getList('MENU')
        ]);
        await App.renderPage('images', { 
            cover: cover.data, 
            gallery: gallery.data, 
            menu: menu.data 
        }, true);
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
                this.previewImage(e.target.files[0]);
            });
        }

        document.querySelectorAll('[data-action="deleteImage"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const imageId = btn.dataset.id;
                await this.handleDelete(imageId, App);
            });
        });

        document.querySelectorAll('[data-action="setPrimary"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const imageId = btn.dataset.id;
                await this.handleSetCover(imageId, App);
            });
        });
    },

    async handleUpload(form, App) {
        const formData = new FormData(form);
        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await ImagesService.upload(formData);
            if (result.success) {
                App.showSuccess('Upload ảnh thành công!');
                window.closeModal('uploadImageModal');
                App.reload();
            }
        } catch (error) {
            App.showError('Upload ảnh thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    previewImage(file) {
        const preview = document.getElementById('imagePreview');
        if (preview && file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
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
