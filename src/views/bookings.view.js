/**
 * Bookings View
 * Xử lý logic render và sự kiện cho trang Quản lý đặt bàn
 */
import { BookingsService } from '../services/bookings.service.js';
import { TablesService } from '../services/tables.service.js';
import { debounce } from '../utils/helpers.js';

export const BookingsView = {
    /**
     * Render trang Bookings
     * @param {Object} App - Reference đến App object
     */
    async render(App, Router) {
        const params = Router.getQueryParams();
        
        // Ensure defaults - use limit/offset
        if (!params.limit) params.limit = 10;
        if (!params.offset) params.offset = 0;

        let result;
        // Use search endpoint if q param is present
        if (params.q && params.q.trim()) {
            result = await BookingsService.search(params.q, params.limit);
        } else {
            result = await BookingsService.getList(params);
        }
        
        // Handle new response structure with pagination
        const responseData = result.data || {};
        const bookingsData = Array.isArray(responseData) ? responseData : (responseData.items || []);
        const pagination = responseData.pagination || {
            total: bookingsData.length,
            limit: 10,
            offset: 0
        };

        // Prepare pagination view model using offset-based pagination
        const limit = parseInt(pagination.limit) || 10;
        // Use params.offset as source of truth if API doesn't return it
        const offset = parseInt(params.offset) || parseInt(pagination.offset) || 0;
        const total = pagination.total || 0;
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);
        
        pagination.currentPage = currentPage;
        pagination.totalPages = totalPages;
        pagination.hasPrev = currentPage > 1;
        pagination.hasNext = currentPage < totalPages;
        pagination.from = total === 0 ? 0 : offset + 1;
        pagination.to = Math.min(offset + limit, total);

        // Fetch tables first for lookup
        const tablesResult = await TablesService.getList();
        const tablesData = tablesResult.data || {};
        const tables = Array.isArray(tablesData) ? tablesData : (tablesData.items || tablesData.data || []);
        
        // Create lookup map: table_id -> table_name
        const tableMap = {};
        tables.forEach(t => {
            tableMap[t.id] = t.name;
        });

        // Map API response (snake_case) to View format (camelCase)
        const bookings = bookingsData.map(b => ({
            id: b.id,
            code: b.code || `B${b.id}`, // Fallback code
            customerName: b.customer_name || b.user?.display_name || 'Khách vãng lai',
            customerPhone: b.phone || b.user?.phone,
            guests: b.people_count,
            datetime: b.booking_time,
            // Lookup table name: prefer nested table object, then lookup from tableMap
            tableName: b.table?.name || b.table_name || (b.table_id ? tableMap[b.table_id] : null),
            tableId: b.table_id,
            status: b.status,
            deposit: b.deposit_amount
        }));

        await App.renderPage('bookings', { data: bookings, total, tables, pagination }, true);

        // Pre-fill filter form
        const form = document.getElementById('bookingFilterForm');
        if (form) {
            if (params.from_date) form.querySelector('[name="from_date"]').value = params.from_date;
            if (params.to_date) form.querySelector('[name="to_date"]').value = params.to_date;
            if (params.status) form.querySelector('[name="status"]').value = params.status;
            if (params.q) form.querySelector('[name="q"]').value = params.q;
        }

        this.bindEvents(App, Router);
    },

    /**
     * Bind các event handlers cho trang Bookings
     */
    bindEvents(App, Router) {
        // Global page change handler using offset
        window.changePage = (page) => {
            const currentParams = Router.getQueryParams();
            const limit = parseInt(currentParams.limit) || 10;
            const newOffset = (page - 1) * limit;
            
            const params = new URLSearchParams();
            if (currentParams.status) params.set('status', currentParams.status);
            if (currentParams.from_date) params.set('from_date', currentParams.from_date);
            if (currentParams.to_date) params.set('to_date', currentParams.to_date);
            if (currentParams.q) params.set('q', currentParams.q);
            params.set('limit', limit);
            params.set('offset', newOffset);
            
            Router.navigate(`/bookings?${params.toString()}`);
        };

        // Debounced search input - 500ms là giá trị tiêu chuẩn tối ưu cho UX và API calls
        const searchInput = document.querySelector('[name="q"]');
        if (searchInput) {
            const handleSearch = debounce((e) => {
                const q = e.target.value.trim();
                const currentParams = Router.getQueryParams();
                
                const params = new URLSearchParams();
                if (currentParams.status) params.set('status', currentParams.status);
                if (currentParams.from_date) params.set('from_date', currentParams.from_date);
                if (currentParams.to_date) params.set('to_date', currentParams.to_date);
                if (q) params.set('q', q);
                params.set('limit', currentParams.limit || 10);
                params.set('offset', 0); // Reset to first page on new search
                
                Router.navigate(`/bookings?${params.toString()}`);
            }, 500); // 500ms debounce - tối ưu cho realtime search
            
            searchInput.addEventListener('input', handleSearch);
        }

        // Xử lý filter và search
        const filterForm = document.getElementById('bookingFilterForm');
        if (filterForm) {
            filterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(filterForm);
                const params = new URLSearchParams();
                
                formData.forEach((value, key) => {
                    if (value) params.append(key, value);
                });
                
                // Reset to page 1 on new filter
                params.set('page', 1);
                
                Router.navigate(`/bookings?${params.toString()}`);
            });
            
            filterForm.addEventListener('reset', () => {
                 setTimeout(() => {
                    Router.navigate('/bookings');
                 }, 0);
            });
        }

        // Confirm booking
        document.querySelectorAll('[data-action="confirmBooking"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                await this.handleBookingAction('confirm', bookingId, App);
            });
        });

        // Check-in booking
        document.querySelectorAll('[data-action="checkInBooking"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                await this.handleBookingAction('checkin', bookingId, App);
            });
        });

        // Cancel booking
        document.querySelectorAll('[data-action="cancelBooking"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                if (confirm('Bạn có chắc muốn huỷ booking này?')) {
                    await this.handleBookingAction('cancel', bookingId, App);
                }
            });
        });

        // No-show booking
        document.querySelectorAll('[data-action="noShowBooking"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                if (confirm('Xác nhận khách không đến?')) {
                    await this.handleBookingAction('noshow', bookingId, App);
                }
            });
        });

        // Assign table
        document.querySelectorAll('[data-action="assignTable"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                document.getElementById('assignBookingId').value = bookingId;
                window.openModal('assignTableModal');
            });
        });

        // Confirm assign table
        const confirmAssignBtn = document.getElementById('confirmAssignTable');
        if (confirmAssignBtn) {
            confirmAssignBtn.addEventListener('click', async () => {
                const bookingId = document.getElementById('assignBookingId').value;
                const tableId = document.getElementById('selectTable').value;
                if (!tableId) {
                    App.showError('Vui lòng chọn bàn');
                    return;
                }
                try {
                    const result = await BookingsService.assignTable(bookingId, tableId);
                    if (result.success) {
                        App.showSuccess('Gán bàn thành công!');
                        window.closeModal('assignTableModal');
                        App.reload();
                    }
                } catch (error) {
                    App.showError('Gán bàn thất bại. Vui lòng thử lại.');
                }
            });
        }
    },

    /**
     * Xử lý các action trên booking
     */
    async handleBookingAction(action, bookingId, App) {
        try {
            let result;
            switch (action) {
                case 'confirm':
                    result = await BookingsService.confirm(bookingId);
                    break;
                case 'cancel':
                    result = await BookingsService.cancel(bookingId);
                    break;
                case 'checkin':
                    result = await BookingsService.checkIn(bookingId);
                    break;
                case 'noshow':
                    result = await BookingsService.noShow(bookingId);
                    break;
            }
            if (result?.success) {
                App.showSuccess('Cập nhật thành công!');
                App.reload();
            }
        } catch (error) {
            // Show BE error message if available (e.g. "Chỉ có thể đánh dấu NO_SHOW sau 15 phút")
            const errorMessage = error.message || error.data?.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            App.showError(errorMessage);
        }
    },

    /**
     * Hiển thị modal chi tiết booking (Public method để gọi từ nơi khác)
     */
    async showDetailModal(bookingId, App) {
        // Sử dụng notificationDetailModal (đã có sẵn trong main.hbs)
        // hoặc tạo bookingDetailModal riêng nếu cần. Ở đây tái sử dụng cái của notification cho giống UI.
        // Tuy nhiên để tránh xung đột, tốt nhất nên dùng 1 modal chung cho "Booking Detail".
        // Ta sẽ inject dynamic nếu chưa có, hoặc dùng cái có sẵn.
        
        let modalId = 'globalBookingDetailModal';
        let modalEl = document.getElementById(modalId);
        
        if (!modalEl) {
            const modalHtml = `
                <div id="${modalId}" class="modal hidden">
                    <div class="modal-backdrop" onclick="closeModal('${modalId}')"></div>
                    <div class="modal-content max-w-lg">
                        <div class="modal-header">
                            <h3 class="modal-title">Chi tiết đặt bàn</h3>
                            <button class="modal-close" onclick="closeModal('${modalId}')">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div class="modal-body" id="${modalId}Content">
                            <div class="text-center py-4">
                                <i class="fa-solid fa-spinner fa-spin text-2xl text-stone-400"></i>
                            </div>
                        </div>
                        <div class="modal-footer" id="${modalId}Footer">
                            <button class="btn btn-secondary" onclick="closeModal('${modalId}')">Đóng</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modalEl = document.getElementById(modalId);
        }

        const contentEl = document.getElementById(`${modalId}Content`);
        const footerEl = document.getElementById(`${modalId}Footer`);
        
        contentEl.innerHTML = `<div class="text-center py-4"><i class="fa-solid fa-spinner fa-spin text-2xl text-stone-400"></i></div>`;
        window.openModal(modalId);

        await this.renderDetailContent(bookingId, contentEl, footerEl, App, modalId);
    },

    /**
     * Render nội dung chi tiết booking vào container
     */
    async renderDetailContent(bookingId, contentEl, footerEl, App, modalId) {
        if (!bookingId) {
            contentEl.innerHTML = `<p class="text-stone-500">Không tìm thấy thông tin đặt bàn</p>`;
            return;
        }

        try {
            const booking = await BookingsService.getById(bookingId);
            if (!booking) {
                contentEl.innerHTML = `<p class="text-stone-500">Không tìm thấy thông tin đặt bàn</p>`;
                return;
            }

            const statusMap = {
                'PENDING': { label: 'Chờ xác nhận', class: 'badge-pending' },
                'CONFIRMED': { label: 'Đã xác nhận', class: 'badge-confirmed' },
                'CHECKED_IN': { label: 'Đã check-in', class: 'badge-checked-in' },
                'COMPLETED': { label: 'Đã hoàn thành', class: 'badge-checked-in' },
                'CANCELLED': { label: 'Đã hủy', class: 'badge-cancelled' },
                'NO_SHOW': { label: 'Không đến', class: 'badge-no-show' }
            };
            const status = statusMap[booking.status] || { label: booking.status, class: 'badge-no-show' };

            contentEl.innerHTML = `
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <code class="bg-stone-100 px-3 py-1.5 rounded text-sm font-mono font-semibold">${booking.code || 'N/A'}</code>
                        <span class="badge ${status.class}">${status.label}</span>
                    </div>
                    
                    <div class="bg-stone-50 rounded-lg p-4">
                        <h4 class="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-user"></i>
                            Thông tin khách hàng
                        </h4>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span class="text-stone-500">Họ tên:</span>
                                <p class="font-medium text-stone-900">${booking.customerName || 'N/A'}</p>
                            </div>
                            <div>
                                <span class="text-stone-500">Số điện thoại:</span>
                                <p class="font-medium text-stone-900">${booking.customerPhone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-stone-50 rounded-lg p-4">
                        <h4 class="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-calendar-check"></i>
                            Thông tin đặt bàn
                        </h4>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span class="text-stone-500">Thời gian:</span>
                                <p class="font-medium text-stone-900">${booking.datetime ? new Date(booking.datetime).toLocaleString('vi-VN') : 'N/A'}</p>
                            </div>
                            <div>
                                <span class="text-stone-500">Số khách:</span>
                                <p class="font-medium text-stone-900">${booking.guests || 'N/A'} người</p>
                            </div>
                            <div>
                                <span class="text-stone-500">Bàn:</span>
                                <p class="font-medium text-stone-900">${booking.tableName || 'Chưa gán'}</p>
                            </div>
                            <div>
                                <span class="text-stone-500">Tiền cọc:</span>
                                <p class="font-medium ${booking.deposit ? 'text-green-600' : 'text-stone-400'}">${booking.deposit ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.deposit) : 'Không có'}</p>
                            </div>
                        </div>
                    </div>
                    
                    ${booking.notes ? `
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <h4 class="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                            <i class="fa-solid fa-note-sticky"></i>
                            Ghi chú
                        </h4>
                        <p class="text-sm text-yellow-800">${booking.notes}</p>
                    </div>
                    ` : ''}
                </div>
            `;

            // Build action buttons
            let actions = `<button class="btn btn-secondary" onclick="closeModal('${modalId}')">Đóng</button>`;
            
            // Chỉ thêm các nút action nếu modalId không phải là view-only hoặc tùy ngữ cảnh.
            // Ở đây logic giống notifications view
            if (booking.status === 'PENDING') {
                actions += `<button class="btn btn-success" data-action="modal-confirm-booking" data-id="${bookingId}"><i class="fa-solid fa-check"></i> Xác nhận</button>`;
                actions += `<button class="btn btn-danger" data-action="modal-cancel-booking" data-id="${bookingId}"><i class="fa-solid fa-xmark"></i> Hủy</button>`;
            } else if (booking.status === 'CONFIRMED') {
                actions += `<button class="btn btn-primary" data-action="modal-checkin-booking" data-id="${bookingId}"><i class="fa-solid fa-door-open"></i> Check-in</button>`;
            }
            
            if (footerEl) {
                footerEl.innerHTML = actions;
                this.bindDetailActions(footerEl, App, modalId);
            }

        } catch (error) {
            console.error('Error in renderDetailContent:', error);
            contentEl.innerHTML = `<div class="text-center py-4 text-red-500">
                <i class="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                <p>Lỗi khi tải thông tin booking</p>
            </div>`;
        }
    },

    bindDetailActions(container, App, modalId) {
        container.querySelector('[data-action="modal-confirm-booking"]')?.addEventListener('click', async (e) => {
            const bookingId = e.target.closest('[data-id]').dataset.id;
            const btn = e.target.closest('button');
            try {
                // Loading state
                const originalHtml = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

                const result = await BookingsService.confirm(bookingId);
                if (result.success) {
                    App.showSuccess('Đã xác nhận đặt bàn!');
                    window.closeModal(modalId);
                    App.reload();
                } else {
                    App.showError('Không thể xác nhận.');
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
            } catch (error) {
                App.showError('Có lỗi xảy ra.');
                btn.disabled = false;
                btn.innerHTML = originalHtml; // restore not defined here but simple enough
            }
        });
        
        container.querySelector('[data-action="modal-cancel-booking"]')?.addEventListener('click', async (e) => {
            const bookingId = e.target.closest('[data-id]').dataset.id;
            if(!confirm('Chắc chắn hủy đơn này?')) return;
            
            try {
                const result = await BookingsService.cancel(bookingId);
                if (result.success) {
                    App.showSuccess('Đã hủy đặt bàn!');
                    window.closeModal(modalId);
                    App.reload();
                }
            } catch (error) {
                App.showError('Có lỗi xảy ra.');
            }
        });
        
        container.querySelector('[data-action="modal-checkin-booking"]')?.addEventListener('click', async (e) => {
            const bookingId = e.target.closest('[data-id]').dataset.id;
            try {
                const result = await BookingsService.checkIn(bookingId);
                if (result.success) {
                    App.showSuccess('Đã check-in thành công!');
                    window.closeModal(modalId);
                    App.reload();
                }
            } catch (error) {
                App.showError('Có lỗi xảy ra.');
            }
        });
    }
};
