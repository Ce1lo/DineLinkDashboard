/**
 * Notifications View
 * Xử lý logic render và sự kiện cho trang Thông báo
 */
import { NotificationsService } from '../services/notifications.service.js';
import { BookingsService } from '../services/bookings.service.js';

export const NotificationsView = {
    async render(App, Router) {
        const params = Router.getQueryParams();
        const data = await NotificationsService.getList(params);
        await App.renderPage('notifications', data, true);
        this.bindEvents(App, Router);
    },

    bindEvents(App, Router) {
        document.querySelectorAll('[data-action="notification-click"]').forEach(item => {
            item.addEventListener('click', async () => {
                const notificationId = item.dataset.notificationId;
                const type = item.dataset.type;
                const bookingId = item.dataset.bookingId;
                
                await this.handleMarkRead(notificationId, App);
                
                switch (type) {
                    case 'BOOKING_CREATED':
                    case 'BOOKING_CONFIRMED':
                    case 'BOOKING_CANCELLED':
                        if (bookingId) {
                            await this.showBookingDetail(bookingId, App);
                        } else {
                            Router.navigate('/bookings');
                        }
                        break;
                    case 'REVIEW_CREATED':
                        Router.navigate('/reviews');
                        break;
                }
            });
        });

        const markAllBtn = document.querySelector('[data-action="mark-all-read"]');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', async () => {
                await this.handleMarkAllRead(App);
            });
        }

        const readFilter = document.getElementById('readFilter');
        if (readFilter) {
            readFilter.addEventListener('change', () => {
                const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
                if (readFilter.value) {
                    params.set('is_read', readFilter.value);
                } else {
                    params.delete('is_read');
                }
                Router.navigate(`/notifications${params.toString() ? '?' + params.toString() : ''}`);
            });
        }

        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
                if (typeFilter.value) {
                    params.set('type', typeFilter.value);
                } else {
                    params.delete('type');
                }
                Router.navigate(`/notifications${params.toString() ? '?' + params.toString() : ''}`);
            });
        }
    },

    /**
     * Hiển thị chi tiết booking trong modal
     */
    async showBookingDetail(bookingId, App) {
        const contentEl = document.getElementById('bookingDetailContent');
        if (!contentEl) {
            // Modal not present on this page, create it dynamically
            const modalHtml = `
                <div id="bookingDetailModal" class="hidden">
                    <div class="modal-backdrop" onclick="closeModal('bookingDetailModal')"></div>
                    <div class="modal">
                        <div class="modal-header">
                            <h5 class="modal-title">Chi tiết đặt bàn</h5>
                            <button class="modal-close" onclick="closeModal('bookingDetailModal')">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div class="modal-body" id="bookingDetailContent">
                            <div class="text-center py-4">
                                <i class="fa-solid fa-spinner fa-spin text-2xl text-stone-400"></i>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeModal('bookingDetailModal')">Đóng</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
        
        const content = document.getElementById('bookingDetailContent');
        content.innerHTML = `
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
                
                content.innerHTML = `
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
            } else {
                content.innerHTML = `
                    <div class="text-center py-4 text-stone-500">
                        <i class="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                        <p>Không tìm thấy thông tin booking</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading booking detail:', error);
            content.innerHTML = `
                <div class="text-center py-4 text-red-500">
                    <i class="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                    <p>Lỗi khi tải thông tin booking</p>
                </div>
            `;
        }
    },

    async handleMarkRead(notificationId, App) {
        try {
            const result = await NotificationsService.markAsRead(notificationId);
            if (result.success) {
                const notification = document.querySelector(`[data-notification-id="${notificationId}"]`);
                if (notification) {
                    notification.classList.remove('unread');
                    notification.querySelector('[data-action="mark-read"]')?.remove();
                }
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    },

    async handleMarkAllRead(App) {
        try {
            const result = await NotificationsService.markAllAsRead();
            if (result.success) {
                App.showSuccess('Đã đánh dấu tất cả là đã đọc!');
                App.reload();
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
};
