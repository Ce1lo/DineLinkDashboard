/**
 * Bookings View
 * Xử lý logic render và sự kiện cho trang Quản lý đặt bàn
 */
import { BookingsService } from '../services/bookings.service.js';
import { TablesService } from '../services/tables.service.js';

export const BookingsView = {
    /**
     * Render trang Bookings
     * @param {Object} App - Reference đến App object
     */
    async render(App, Router) {
        const params = Router.getQueryParams();
        const data = await BookingsService.getList(params);
        const tables = await TablesService.getList();
        await App.renderPage('bookings', { ...data, tables: tables.data }, true);
        this.bindEvents(App, Router);
    },

    /**
     * Bind các event handlers cho trang Bookings
     */
    bindEvents(App, Router) {
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
                Router.navigate(`/bookings?${params.toString()}`);
            });
        }

        // View booking - show modal with details
        document.querySelectorAll('[data-action="viewBooking"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                await this.showBookingDetail(bookingId, App);
            });
        });

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
     * Hiển thị chi tiết booking trong modal
     */
    async showBookingDetail(bookingId, App) {
        const contentEl = document.getElementById('bookingDetailContent');
        if (!contentEl) return;
        
        // Show loading
        contentEl.innerHTML = `
            <div class="text-center py-4">
                <i class="fa-solid fa-spinner fa-spin text-2xl text-stone-400"></i>
            </div>
        `;
        window.openModal('bookingDetailModal');
        
        try {
            const booking = await BookingsService.getById(bookingId);
            if (booking) {
                const statusMap = {
                    'PENDING': { label: 'Chờ xác nhận', class: 'badge-pending' },
                    'CONFIRMED': { label: 'Đã xác nhận', class: 'badge-confirmed' },
                    'CHECKED_IN': { label: 'Đã check-in', class: 'badge-checked-in' },
                    'CANCELLED': { label: 'Đã hủy', class: 'badge-cancelled' },
                    'NO_SHOW': { label: 'Không đến', class: 'badge-no-show' }
                };
                const status = statusMap[booking.status] || { label: booking.status, class: 'badge-no-show' };
                
                contentEl.innerHTML = `
                    <div class="space-y-4">
                        <!-- Booking Code -->
                        <div class="flex items-center justify-between">
                            <code class="bg-stone-100 px-3 py-1.5 rounded text-sm font-mono font-semibold">${booking.code || 'N/A'}</code>
                            <span class="badge ${status.class}">${status.label}</span>
                        </div>
                        
                        <!-- Customer Info -->
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
                        
                        <!-- Booking Info -->
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
                        <!-- Notes -->
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
            } else {
                contentEl.innerHTML = `
                    <div class="text-center py-4 text-stone-500">
                        <i class="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                        <p>Không tìm thấy thông tin booking</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading booking detail:', error);
            contentEl.innerHTML = `
                <div class="text-center py-4 text-red-500">
                    <i class="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                    <p>Lỗi khi tải thông tin booking</p>
                </div>
            `;
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
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
};
