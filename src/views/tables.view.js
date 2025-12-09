/**
 * Tables View
 * Xử lý logic render và sự kiện cho trang Quản lý bàn
 */
import { TablesService } from '../services/tables.service.js';

export const TablesView = {
    /**
     * Render trang Tables
     * @param {Object} App - Reference đến App object
     */
    async render(App) {
        const data = await TablesService.getList();
        await App.renderPage('tables', data, true);
        this.bindEvents(App);
    },

    /**
     * Bind các event handlers cho trang Tables
     */
    bindEvents(App) {
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

        // Nút xóa bàn
        document.querySelectorAll('[data-action="delete-table"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const tableId = btn.dataset.tableId;
                await this.handleDeleteTable(tableId, App);
            });
        });

        // Nút mở modal sửa
        document.querySelectorAll('[data-action="edit-table"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tableDataStr = btn.dataset.table;
                if (tableDataStr) {
                    try {
                        const tableData = JSON.parse(tableDataStr);
                        this.populateEditForm(tableData);
                        window.openModal('tableFormModal');
                    } catch (err) {
                        console.error('Error parsing table data:', err);
                    }
                }
            });
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
        const data = Object.fromEntries(formData.entries());
        data.capacity = parseInt(data.capacity);

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await TablesService.create(data);
            if (result.success) {
                App.showSuccess('Thêm bàn thành công!');
                window.closeModal('tableFormModal');
                form.reset();
                App.reload();
            }
        } catch (error) {
            App.showError('Thêm bàn thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    /**
     * Xử lý sửa bàn
     */
    async handleEditTable(form, App) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const tableId = data.tableId;
        delete data.tableId;
        data.capacity = parseInt(data.capacity);

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await TablesService.update(tableId, data);
            if (result.success) {
                App.showSuccess('Cập nhật bàn thành công!');
                window.closeModal('tableFormModal');
                App.reload();
            }
        } catch (error) {
            App.showError('Cập nhật bàn thất bại. Vui lòng thử lại.');
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
    }
};
