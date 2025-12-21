/**
 * Tables View
 * Xử lý logic render và sự kiện cho trang Quản lý bàn
 */
import { TablesService } from '../services/tables.service.js';
import { AuthService } from '../services/auth.service.js';
import { CONFIG } from '../config.js';

export const TablesView = {
    /**
     * Render trang Tables
     * @param {Object} App - Reference đến App object
     */
    // State management
    params: {
        page: 1,
        limit: 12
    },

    /**
     * Render trang Tables
     * @param {Object} App - Reference đến App object
     */
    async render(App, Router) {
        // Get params from URL instead of local state
        const params = Router.getQueryParams();
        
        // Ensure defaults - use limit/offset
        if (!params.limit) params.limit = 12;
        if (!params.offset) params.offset = 0;

        const result = await TablesService.getList(params);
        
        // Normalize data
        const tablesData = result.data || {};
        const tables = Array.isArray(tablesData) ? tablesData : (tablesData.items || tablesData.data || []);
        
        // Prepare pagination data using offset-based pagination
        const paginationData = result.pagination || tablesData.pagination || {
            total: tables.length,
            limit: 12,
            offset: 0
        };

        const limit = parseInt(params.limit) || 12;
        const offset = parseInt(params.offset) || 0;
        const total = paginationData.total || 0;
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);

        const pagination = {
            total,
            limit,
            offset,
            currentPage,
            totalPages,
            hasPrev: currentPage > 1,
            hasNext: currentPage < totalPages,
            from: total === 0 ? 0 : offset + 1,
            to: Math.min(offset + limit, total)
        };
        
        // Pass isOwner flag to template for role-based UI
        const isOwner = AuthService.isOwner();
        
        await App.renderPage('tables', { 
            data: tables,
            pagination,
            isOwner
        }, true);
        
        this.bindEvents(App, Router);
    },

    /**
     * Bind các event handlers cho trang Tables
     */
    bindEvents(App, Router) {
        // Pagination Events - Global handler using offset
        window.changePage = (page) => {
            const currentParams = Router.getQueryParams();
            const limit = parseInt(currentParams.limit) || 12;
            const newOffset = (page - 1) * limit;
            
            const params = new URLSearchParams();
            if (currentParams.q) params.set('q', currentParams.q);
            params.set('limit', limit);
            params.set('offset', newOffset);
            
            Router.navigate(`/tables?${params.toString()}`);
        };

        // Form thêm/sửa bàn (dùng chung 1 form)
        const tableForm = document.getElementById('tableForm');
        if (tableForm) {
            tableForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const tableId = document.getElementById('tableId').value;
                if (tableId) {
                    await this.handleEditTable(tableForm, App);
                } else {
                    await this.handleAddTable(tableForm, App);
                }
            });
        }

        // Event Delegation: Nút xóa bàn
        document.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('[data-action="delete-table"]');
            console.log('[DEBUG] Click detected, deleteBtn:', deleteBtn);
            if (deleteBtn) {
                e.stopPropagation();
                const tableId = deleteBtn.dataset.tableId;
                console.log('[DEBUG] Deleting table:', tableId);
                await this.handleDeleteTable(tableId, App);
            }
        });

        // Event Delegation: Nút mở modal sửa
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('[data-action="edit-table"]');
            if (editBtn) {
                e.stopPropagation();
                const tableDataStr = editBtn.dataset.table;
                if (tableDataStr) {
                    try {
                        const tableData = JSON.parse(tableDataStr);
                        this.populateEditForm(tableData);
                        window.openModal('tableFormModal');
                    } catch (err) {
                        console.error('Error parsing table data:', err);
                    }
                }
            }
        });

        // Image upload handling
        const uploadArea = document.querySelector('#tableFormModal .border-dashed');
        const fileInput = document.getElementById('tableViewImage');
        const previewContainer = document.getElementById('viewImagePreview');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.previewImage(file, previewContainer);
                }
            });
        }

        // Event Delegation: Remove current view image button
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('[data-action="remove-view-image"]');
            if (removeBtn) {
                e.stopPropagation();
                if (!confirm('Xóa ảnh này?')) return;
                
                // Clear preview
                const preview = document.getElementById('viewImagePreview');
                if (preview) preview.innerHTML = '';
                
                // Add hidden flag to signal deletion on save
                let deleteInput = document.getElementById('deleteViewImageFlag');
                if (!deleteInput) {
                    deleteInput = document.createElement('input');
                    deleteInput.type = 'hidden';
                    deleteInput.id = 'deleteViewImageFlag';
                    deleteInput.name = 'deleteViewImage';
                    document.getElementById('tableForm')?.appendChild(deleteInput);
                }
                deleteInput.value = 'true';
            }
        });

        // Reset form when opening add modal
        const addBtn = document.querySelector('[data-action="addTable"]');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const title = document.getElementById('tableFormTitle');
                if (title) title.textContent = 'Thêm bàn mới';
                document.getElementById('tableId').value = '';
                document.getElementById('tableForm').reset();
                const preview = document.getElementById('viewImagePreview');
                if (preview) preview.innerHTML = '';
                // Hide current image container (for edit mode)
                const currentImgContainer = document.getElementById('currentViewImageContainer');
                if (currentImgContainer) currentImgContainer.classList.add('hidden');
                // Clear deletion flag if any
                const deleteFlag = document.getElementById('deleteViewImageFlag');
                if (deleteFlag) deleteFlag.remove();
            });
        }
    },

    /**
     * Preview selected image
     */
    previewImage(file, container) {
        if (!container) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            container.innerHTML = `
                <div class="relative inline-block w-full">
                    <img src="${e.target.result}" alt="Preview" 
                         class="w-full h-32 object-cover rounded-lg border border-stone-200">
                    <button type="button" 
                            class="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            id="removeImagePreview">
                        <i class="fa-solid fa-xmark text-xs"></i>
                    </button>
                </div>
            `;
            // Add remove button handler
            document.getElementById('removeImagePreview')?.addEventListener('click', () => {
                container.innerHTML = '';
                document.getElementById('tableViewImage').value = '';
            });
        };
        reader.readAsDataURL(file);
    },

    /**
     * Xử lý thêm bàn mới
     */
    async handleAddTable(form, App) {
        const formData = new FormData(form);
        
        // Extract file separately
        const imageFile = formData.get('viewImage');
        const hasImage = imageFile && imageFile.size > 0;
        
        // Prepare JSON payload
        const data = Object.fromEntries(formData.entries());
        data.capacity = parseInt(data.capacity);
        
        // Remove file object from JSON payload to avoid validation error
        delete data.viewImage;

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await TablesService.create(data);
            
            if (result.success) {
                // Upload image if selected
                if (hasImage && result.data?.id) {
                    try {
                        await TablesService.uploadViewImage(result.data.id, imageFile);
                    } catch (uploadError) {
                        console.warn('Upload image failed:', uploadError);
                        App.showWarning('Tạo bàn thành công nhưng tải ảnh thất bại.');
                        window.closeModal('tableFormModal');
                        form.reset();
                        App.reload();
                        return;
                    }
                }
                
                App.showSuccess('Thêm bàn thành công!');
                window.closeModal('tableFormModal');
                form.reset();
                const preview = document.getElementById('viewImagePreview');
                if (preview) preview.innerHTML = '';
                App.reload();
            }
        } catch (error) {
            let message = error.message || 'Thêm bàn thất bại. Vui lòng thử lại.';
            const details = error.data?.error?.details || error.data?.details;
            if (details && Array.isArray(details)) {
                message = details
                    .map(d => d.message.replace(/"/g, ''))
                    .join('<br>');
            }
            App.showError(message);
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    /**
     * Xử lý sửa bàn
     */
    async handleEditTable(form, App) {
        const formData = new FormData(form);
        
        // Extract file separately
        const imageFile = formData.get('viewImage');
        const hasImage = imageFile && imageFile.size > 0;

        const data = Object.fromEntries(formData.entries());
        const tableId = data.id; // Form uses name="id" for the hidden input
        delete data.id;
        data.capacity = parseInt(data.capacity);
        
        // Remove file from payload
        delete data.viewImage;

        // Check deletion flag
        if (data.deleteViewImage === 'true') {
            data.view_image_url = ''; // or null, to clear it in BE
            delete data.deleteViewImage;
        } else if (hasImage) {
            // If new image is uploaded, it will override anyway.
            // But usually we don't send view_image_url string if we upload file separately.
            // Wait, logic below handles upload separately.
        }

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await TablesService.update(tableId, data);
            
            if (result.success) {
                // Upload image if selected
                if (hasImage) {
                    try {
                        await TablesService.uploadViewImage(tableId, imageFile);
                    } catch (uploadError) {
                         console.warn('Upload image failed:', uploadError);
                         App.showWarning('Cập nhật bàn thành công nhưng tải ảnh thất bại.');
                         window.closeModal('tableFormModal');
                         App.reload();
                         return;
                    }
                }

                App.showSuccess('Cập nhật bàn thành công!');
                window.closeModal('tableFormModal');
                App.reload();
            }
        } catch (error) {
            let message = error.message || 'Cập nhật bàn thất bại. Vui lòng thử lại.';
            const details = error.data?.error?.details || error.data?.details;
            if (details && Array.isArray(details)) {
                message = details
                    .map(d => d.message.replace(/"/g, ''))
                    .join('<br>');
            }
            App.showError(message);
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    /**
     * Xử lý xóa bàn
     */
    async handleDeleteTable(tableId, App) {
        if (!confirm('Bạn có chắc muốn xóa bàn này?')) return;

        try {
            const result = await TablesService.delete(tableId);
            if (result.success) {
                App.showSuccess('Xóa bàn thành công!');
                App.reload();
            }
        } catch (error) {
            App.showError('Xóa bàn thất bại. Vui lòng thử lại.');
        }
    },

    /**
     * Điền dữ liệu vào form sửa
     */
    populateEditForm(tableData) {
        const title = document.getElementById('tableFormTitle');
        if (title) title.textContent = 'Chỉnh sửa bàn';
        
        const tableId = document.getElementById('tableId');
        const tableName = document.getElementById('tableName');
        const tableCapacity = document.getElementById('tableCapacity');
        const tableArea = document.getElementById('tableArea');
        const tableStatus = document.getElementById('tableStatus');
        const viewDescription = document.getElementById('viewDescription');
        
        if (tableId) tableId.value = tableData.id || '';
        if (tableName) tableName.value = tableData.name || '';
        if (tableCapacity) tableCapacity.value = tableData.capacity || '';
        if (tableArea) tableArea.value = tableData.area || tableData.location || '';
        if (tableStatus) tableStatus.value = tableData.status || 'ACTIVE';
        if (viewDescription) viewDescription.value = tableData.viewNote || '';

        // Show existing image
        const preview = document.getElementById('viewImagePreview');
        if (preview) {
            preview.innerHTML = '';
            // Check both camelCase and snake_case for compatibility
            const existingImage = tableData.view_image_url || tableData.viewImage;
            if (existingImage) {
                // Normalize URL: prepend API_BASE_URL for relative paths
                const imageUrl = existingImage.startsWith('http') 
                    ? existingImage 
                    : `${CONFIG.API_BASE_URL}${existingImage}`;
                preview.innerHTML = `
                <div class="relative inline-block w-full">
                    <img src="${imageUrl}" alt="Current View" 
                         class="w-full h-32 object-cover rounded-lg border border-stone-200">
                    <button type="button" 
                            class="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            data-action="remove-view-image" title="Xóa ảnh">
                        <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                </div>`;
            }
        }
    }
};
