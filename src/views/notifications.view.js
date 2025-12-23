/**
 * Notifications View
 * Xử lý logic render và sự kiện cho trang Thông báo
 */
import { NotificationsService } from '../services/notifications.service.js';
import { BookingsService } from '../services/bookings.service.js';
import { ReviewsService } from '../services/reviews.service.js';
import { AccountsService } from '../services/accounts.service.js';
import { BookingDetailModal } from '../components/booking-detail-modal.js';

export const NotificationsView = {
    async render(App, Router) {
        const params = Router.getQueryParams();
        
        // Ensure defaults for pagination - use limit/offset like bookings
        if (!params.limit) params.limit = 10;
        if (!params.offset) params.offset = 0;
        
        const result = await NotificationsService.getList(params);
        
        // Service now returns: { data: { items: [...], pagination: {...} }, success: true }
        const notifData = result.data || {};
        const rawNotifications = notifData.items || [];
        const bePagination = notifData.pagination || {};

        console.log('📢 [NotificationsView] Raw notifications:', rawNotifications);

        // Map backend fields to template-expected fields
        // API uses target_type (BOOKING, REVIEW, ACCOUNT) and target_id
        const notifications = rawNotifications.map(n => {
            // Determine related IDs based on target_type
            let bookingId = null, reviewId = null, accountId = null;
            
            if (n.target_type === 'BOOKING') {
                bookingId = n.target_id;
            } else if (n.target_type === 'REVIEW') {
                reviewId = n.target_id;
            } else if (n.target_type === 'ACCOUNT' || n.target_type === 'STAFF') {
                accountId = n.target_id;
            }
            
            // Also support legacy fields if present
            bookingId = bookingId || n.booking_id || n.bookingId;
            reviewId = reviewId || n.review_id || n.reviewId;
            accountId = accountId || n.account_id || n.accountId;
            
            return {
                id: n.id,
                type: n.type,
                title: n.title,
                content: n.message || n.content || '',
                isRead: n.is_read ?? n.isRead ?? false,
                createdAt: n.created_at || n.createdAt,
                bookingId,
                reviewId,
                accountId
            };
        });

        console.log('📢 [NotificationsView] Mapped notifications:', notifications);

        // Compute pagination values like bookings view
        const limit = parseInt(params.limit) || 10;
        const offset = parseInt(params.offset) || 0;
        const total = bePagination.total || notifications.length;
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit) || 1;
        
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

        await App.renderPage('notifications', { data: notifications, pagination }, true);

        // Set filter values from URL params
        const typeFilter = document.getElementById('typeFilter');
        const readFilter = document.getElementById('readFilter');
        
        if (typeFilter && params.type) {
            typeFilter.value = params.type;
        }
        if (readFilter && params.is_read) {
            readFilter.value = params.is_read;
        }

        this.bindEvents(App, Router);
    },

    bindEvents(App, Router) {
        // Filter handler
        const applyFilterBtn = document.getElementById('applyFilterBtn');
        const typeFilter = document.getElementById('typeFilter');
        const readFilter = document.getElementById('readFilter');

        if (applyFilterBtn && typeFilter && readFilter) {
            applyFilterBtn.addEventListener('click', () => {
                const currentParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
                
                // Update params
                if (typeFilter.value) {
                    currentParams.set('type', typeFilter.value);
                } else {
                    currentParams.delete('type');
                }
                
                if (readFilter.value) {
                    currentParams.set('is_read', readFilter.value);
                } else {
                    currentParams.delete('is_read');
                }
                
                // Reset to page 1
                currentParams.delete('page');

                // Navigate
                Router.navigate(`notifications?${currentParams.toString()}`);
                
                // Show feedback
                App.showSuccess('Đã áp dụng bộ lọc thông báo');
            });
        }

        // Notification click handlers
        document.querySelectorAll('[data-action="notification-click"]').forEach(item => {
            item.addEventListener('click', async () => {
                const notificationId = item.dataset.notificationId;
                const type = item.dataset.type;
                const bookingId = item.dataset.bookingId;
                const reviewId = item.dataset.reviewId;
                const accountId = item.dataset.accountId;
                
                await this.handleMarkRead(notificationId, App);
                await this.showNotificationDetailModal(type, {
                    notificationId,
                    bookingId,
                    reviewId,
                    accountId
                }, App, Router);
            });
        });

        // Delete handlers
        document.querySelectorAll('[data-action="delete-notification"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await this.handleDelete(id, App);
            });
        });

        const markAllBtn = document.querySelector('[data-action="mark-all-read"]');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', async () => {
                await this.handleMarkAllRead(App);
            });
        }
        
        const deleteAllBtn = document.querySelector('[data-action="delete-all"]');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', async () => {
                if(confirm('Bạn có chắc muốn xóa tất cả thông báo?')) {
                    await this.handleDeleteAll(App);
                }
            });
        }


        // Pagination handler - use offset like bookings
        window.changePage = (page) => {
            const limit = 10; // default limit
            const offset = (page - 1) * limit;
            const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
            params.set('limit', limit);
            params.set('offset', offset);
            Router.navigate(`/notifications?${params.toString()}`);
        };

        const resetFilterBtn = document.querySelector('[data-action="reset-filters"]');
        if (resetFilterBtn) {
            resetFilterBtn.addEventListener('click', () => {
                Router.navigate('/notifications');
            });
        }
    },

    updateTypeFilterOptions(selectEl, tab) {
        if (!selectEl) return;
        
        selectEl.innerHTML = '<option value="">Tất cả loại</option>';
        
        const options = {
            booking: [
                { val: 'BOOKING_CREATED', label: 'Booking mới' },
                { val: 'BOOKING_UPDATED', label: 'Cập nhật booking' },
                { val: 'BOOKING_CONFIRMED', label: 'Xác nhận' },
                { val: 'BOOKING_CANCELLED', label: 'Huỷ booking' },
                { val: 'BOOKING_CHECKED_IN', label: 'Check-in' },
                { val: 'BOOKING_NO_SHOW', label: 'Khách không đến' },
                { val: 'BOOKING_PAYMENT_SUCCESS', label: 'Thanh toán thành công' },
                { val: 'BOOKING_PAYMENT_FAILED', label: 'Thanh toán thất bại' },
                { val: 'BOOKING_REFUND_SUCCESS', label: 'Hoàn tiền' },
                { val: 'BOOKING_REMINDER', label: 'Nhắc lịch' }
            ],
            review: [
                { val: 'REVIEW_CREATED', label: 'Đánh giá mới' },
                { val: 'REVIEW_REPLIED', label: 'Phản hồi đánh giá' }
            ],
            staff: [
                { val: 'STAFF_REGISTERED', label: 'Nhân viên mới' },
                { val: 'STAFF_STATUS_CHANGED', label: 'Trạng thái nhân viên' }
            ],
            account: [
                { val: 'PASSWORD_CHANGED', label: 'Đổi mật khẩu' },
                { val: 'PROFILE_UPDATED', label: 'Cập nhật thông tin' }
            ],
            system: [
                { val: 'GENERIC', label: 'Thông báo chung' }
            ]
        };
        
        const tabOptions = options[tab] || [];
        tabOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.val;
            option.textContent = opt.label;
            selectEl.appendChild(option);
        });
    },

    /**
     * Helper to reload current page maintaining filters
     */
    async refreshPage(App) {
        // Since Router.reload() usually re-fetches the route action
        // We just need to ensure the Router stays on the same current URL with params
        window.location.reload(); 
        // Note: For SPA, window.location.reload() refreshes the whole browser.
        // If we want SPA-style reload, we might need a custom Router method or simply re-execute render.
        // But App.reload() in this project creates a full reload which resets state if not in URL.
        // Since we put filters in URL (events above), App.reload() SHOULD work if it keeps the URL.
        // Let's verify App.reload implementation usually: window.location.reload().
        // If so, inputs need to be bound to values from params to persist.
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

    /**
     * Handle delete single notification
     */
    async handleDelete(id, App) {
        if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
        
        try {
            const result = await NotificationsService.delete(id);
            if (result.success) {
                App.showSuccess('Đã xóa thông báo');
                // Remove from UI optimistically
                const item = document.querySelector(`[data-notification-id="${id}"]`);
                if (item) {
                    item.style.transition = 'opacity 0.3s, transform 0.3s';
                    item.style.opacity = '0';
                    item.style.transform = 'translateX(20px)';
                    setTimeout(() => item.remove(), 300);
                }
            } else {
                App.showError('Xóa thông báo thất bại');
            }
        } catch (error) {
            console.error('Delete notification error:', error);
            App.showError('Có lỗi xảy ra khi xóa thông báo');
        }
    },

    /**
     * Handle delete all notifications
     */
    async handleDeleteAll(App) {
        try {
            // Note: API might need a bulk delete endpoint
            // For now, just reload the page
            App.showWarning('Chức năng xóa tất cả đang được phát triển');
            // App.reload();
        } catch (error) {
            App.showError('Có lỗi xảy ra');
        }
    },

    /**
     * Ensure notification modal exists in DOM
     */
    ensureNotificationModal() {
        if (document.getElementById('notificationDetailModal')) return;
        
        const modalHtml = `
            <div id="notificationDetailModal" class="hidden">
                <div class="modal-backdrop" onclick="closeModal('notificationDetailModal')"></div>
                <div class="modal">
                    <div class="modal-header">
                        <h5 class="modal-title" id="notificationModalTitle">Chi tiết thông báo</h5>
                        <button class="modal-close" onclick="closeModal('notificationDetailModal')">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="notificationDetailContent">
                        <div class="text-center py-4">
                            <i class="fa-solid fa-spinner fa-spin text-2xl text-stone-400"></i>
                        </div>
                    </div>
                    <div class="modal-footer" id="notificationDetailFooter">
                        <button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    /**
     * Show notification detail modal with type-specific content
     */
    async showNotificationDetailModal(type, data, App, Router) {
        // Create modal dynamically if it doesn't exist (for non-notification pages)
        this.ensureNotificationModal();
        
        const titleEl = document.getElementById('notificationModalTitle');
        const contentEl = document.getElementById('notificationDetailContent');
        const footerEl = document.getElementById('notificationDetailFooter');
        
        if (!contentEl) {
            console.error('Could not create notification modal');
            return;
        }
        
        // Handle Booking types separately via Shared Component
        if (type.startsWith('BOOKING_')) {
             // Close notification modal first to avoid overlap/conflict if needed, 
             // or just use the shared modal directly.
             // Best UX: Close this, open shared.
             window.closeModal('notificationDetailModal');
             await BookingDetailModal.show(data.bookingId, App);
             return;
        }

        // Set loading state
        contentEl.innerHTML = `<div class="text-center py-4"><i class="fa-solid fa-spinner fa-spin text-2xl text-stone-400"></i></div>`;
        window.openModal('notificationDetailModal');
        
        try {
            switch (type) {
                case 'REVIEW_CREATED':
                    if (titleEl) titleEl.textContent = 'Chi tiết đánh giá';
                    await this.renderReviewDetailContent(data.reviewId, contentEl, footerEl, App);
                    break;
                
                case 'REVIEW_REPLIED':
                    if (titleEl) titleEl.textContent = 'Phản hồi đánh giá';
                    await this.renderReviewDetailContent(data.reviewId, contentEl, footerEl, App);
                    break;
                    
                case 'STAFF_REGISTERED':
                case 'STAFF_STATUS_CHANGED':
                    if (titleEl) titleEl.textContent = 'Thông tin nhân viên';
                    await this.renderMemberApprovalContent(data.accountId, contentEl, footerEl, App);
                    break;
                
                case 'PASSWORD_CHANGED':
                    if (titleEl) titleEl.textContent = 'Đổi mật khẩu';
                    contentEl.innerHTML = `
                        <div class="text-center py-6">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fa-solid fa-key text-3xl text-blue-600"></i>
                            </div>
                            <p class="text-stone-700 font-medium">Mật khẩu đã được thay đổi</p>
                            <p class="text-stone-500 text-sm mt-1">Mật khẩu của bạn đã được cập nhật thành công.</p>
                        </div>
                    `;
                    footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>`;
                    break;
                
                case 'PROFILE_UPDATED':
                    if (titleEl) titleEl.textContent = 'Cập nhật thông tin';
                    contentEl.innerHTML = `
                        <div class="text-center py-6">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fa-solid fa-user-check text-3xl text-blue-600"></i>
                            </div>
                            <p class="text-stone-700 font-medium">Thông tin đã được cập nhật</p>
                            <p class="text-stone-500 text-sm mt-1">Thông tin cá nhân của bạn đã được cập nhật thành công.</p>
                        </div>
                    `;
                    footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>`;
                    break;
                    
                default:
                    contentEl.innerHTML = `<p class="text-stone-600">Không có thông tin chi tiết cho loại thông báo này.</p>`;
                    footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>`;
            }
        } catch (error) {
            console.error('Error loading notification detail:', error);
            contentEl.innerHTML = `<div class="text-center py-4 text-red-500"><i class="fa-solid fa-circle-exclamation text-2xl mb-2"></i><p>Lỗi khi tải thông tin</p></div>`;
            footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>`;
        }
    },

    /**
     * Render review detail content with actual review data and reply form
     */
    async renderReviewDetailContent(reviewId, contentEl, footerEl, App) {
        if (!reviewId) {
            contentEl.innerHTML = `<p class="text-stone-500">Không tìm thấy thông tin đánh giá</p>`;
            footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>
                                  <button class="btn btn-primary" onclick="window.location.pathname='/reviews'">Xem danh sách</button>`;
            return;
        }

        try {
            const review = await ReviewsService.getById(reviewId);
            if (!review) {
                contentEl.innerHTML = `<p class="text-stone-500">Không tìm thấy thông tin đánh giá</p>`;
                return;
            }

            // Generate star rating HTML
            const stars = Array(5).fill('').map((_, i) => 
                i < review.rating 
                    ? '<i class="fa-solid fa-star text-yellow-400"></i>' 
                    : '<i class="fa-regular fa-star text-stone-300"></i>'
            ).join('');

            contentEl.innerHTML = `
                <div class="space-y-4">
                    <!-- Customer Info -->
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                            <i class="fa-solid fa-user text-stone-400"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-stone-900">${review.customerName || 'Khách hàng'}</p>
                            <p class="text-sm text-stone-500">${review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}</p>
                        </div>
                    </div>
                    
                    <!-- Rating -->
                    <div class="flex items-center gap-2">
                        <div class="flex">${stars}</div>
                        <span class="text-sm font-medium text-stone-600">${review.rating}/5</span>
                    </div>
                    
                    <!-- Review Content -->
                    <div class="bg-stone-50 rounded-lg p-4">
                        <p class="text-stone-700">${review.content}</p>
                    </div>
                    
                    ${review.ownerReply ? `
                    <!-- Existing Reply -->
                    <div class="bg-primary-50 border-l-4 border-primary-400 p-3 rounded-r-lg">
                        <p class="text-sm font-medium text-primary-700 mb-1">Phản hồi từ nhà hàng:</p>
                        <p class="text-sm text-stone-600">${review.ownerReply}</p>
                    </div>
                    ` : `
                    <!-- Reply Form -->
                    <form class="space-y-3" id="modalReviewReplyForm" data-review-id="${reviewId}">
                        <label class="block text-sm font-medium text-stone-700">Phản hồi đánh giá</label>
                        <textarea class="form-input w-full" rows="3" placeholder="Nhập phản hồi của bạn..." required></textarea>
                    </form>
                    `}
                </div>
            `;

            if (review.ownerReply) {
                footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>`;
            } else {
                footerEl.innerHTML = `
                    <button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>
                    <button class="btn btn-primary" data-action="modal-submit-review-reply" data-id="${reviewId}">
                        <i class="fa-solid fa-paper-plane"></i> Gửi phản hồi
                    </button>
                `;
                // Bind reply handler
                this.bindModalReviewReplyAction(App);
            }
        } catch (error) {
            console.error('Error loading review:', error);
            contentEl.innerHTML = `<p class="text-red-500">Lỗi khi tải đánh giá</p>`;
        }
    },

    /**
     * Render member approval content with actual account data
     */
    async renderMemberApprovalContent(accountId, contentEl, footerEl, App) {
        if (!accountId) {
            contentEl.innerHTML = `<p class="text-stone-500">Không tìm thấy thông tin tài khoản</p>`;
            footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>
                                  <button class="btn btn-primary" onclick="window.location.pathname='/accounts'">Xem danh sách</button>`;
            return;
        }

        try {
            const account = await AccountsService.getById(accountId);
            if (!account) {
                contentEl.innerHTML = `<p class="text-stone-500">Không tìm thấy thông tin tài khoản</p>`;
                return;
            }

            const statusMap = {
                'PENDING': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
                'ACTIVE': { label: 'Đang hoạt động', class: 'bg-green-100 text-green-800' },
                'INACTIVE': { label: 'Ngừng hoạt động', class: 'bg-stone-100 text-stone-800' }
            };
            const status = statusMap[account.status] || statusMap['PENDING'];

            contentEl.innerHTML = `
                <div class="space-y-4">
                    <!-- Account Info -->
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                            ${(account.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                            <p class="font-semibold text-lg text-stone-900">${account.name || 'N/A'}</p>
                            <p class="text-sm text-stone-500">${account.email || 'N/A'}</p>
                            <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.class}">${status.label}</span>
                        </div>
                    </div>
                    
                    <!-- Details -->
                    <div class="bg-stone-50 rounded-lg p-4">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-stone-500">Số điện thoại</span>
                                <p class="font-medium text-stone-900">${account.phone || 'Chưa cung cấp'}</p>
                            </div>
                            <div>
                                <span class="text-stone-500">Vai trò</span>
                                <p class="font-medium text-stone-900">${account.role === 'STAFF' ? 'Nhân viên' : account.role || 'N/A'}</p>
                            </div>
                            <div class="col-span-2">
                                <span class="text-stone-500">Ngày đăng ký</span>
                                <p class="font-medium text-stone-900">${account.createdAt ? new Date(account.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            if (account.status === 'PENDING') {
                footerEl.innerHTML = `
                    <button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>
                    <button class="btn btn-danger" data-action="modal-reject-account" data-id="${accountId}">
                        <i class="fa-solid fa-xmark"></i> Từ chối
                    </button>
                    <button class="btn btn-success" data-action="modal-approve-account" data-id="${accountId}">
                        <i class="fa-solid fa-check"></i> Duyệt
                    </button>
                `;
                // Bind account action handlers
                this.bindModalAccountActions(App);
            } else {
                footerEl.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('notificationDetailModal')">Đóng</button>`;
            }
        } catch (error) {
            console.error('Error loading account:', error);
            contentEl.innerHTML = `<p class="text-red-500">Lỗi khi tải thông tin tài khoản</p>`;
        }
    },

    /**
     * Bind review reply action in modal
     */
    bindModalReviewReplyAction(App) {
        document.querySelector('[data-action="modal-submit-review-reply"]')?.addEventListener('click', async (e) => {
            const reviewId = e.target.closest('[data-id]').dataset.id;
            const form = document.getElementById('modalReviewReplyForm');
            const reply = form?.querySelector('textarea')?.value;
            
            if (!reply?.trim()) {
                App.showError('Vui lòng nhập nội dung phản hồi');
                return;
            }
            
            try {
                const result = await ReviewsService.reply(reviewId, reply);
                if (result.success) {
                    App.showSuccess('Đã gửi phản hồi thành công!');
                    window.closeModal('notificationDetailModal');
                    App.reload();
                }
            } catch (error) {
                App.showError('Gửi phản hồi thất bại. Vui lòng thử lại.');
            }
        });
    },

    /**
     * Bind account approve/reject actions in modal
     */
    bindModalAccountActions(App) {
        document.querySelector('[data-action="modal-approve-account"]')?.addEventListener('click', async (e) => {
            const accountId = e.target.closest('[data-id]').dataset.id;
            try {
                const result = await AccountsService.approve(accountId);
                if (result.success) {
                    App.showSuccess('Đã duyệt tài khoản thành công!');
                    window.closeModal('notificationDetailModal');
                    App.reload();
                }
            } catch (error) {
                App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        });
        
        document.querySelector('[data-action="modal-reject-account"]')?.addEventListener('click', async (e) => {
            const accountId = e.target.closest('[data-id]').dataset.id;
            try {
                const result = await AccountsService.reject(accountId);
                if (result.success) {
                    App.showSuccess('Đã từ chối tài khoản!');
                    window.closeModal('notificationDetailModal');
                    App.reload();
                }
            } catch (error) {
                App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        });
    },

    /**
     * Bind booking action handlers in modal
     */
    bindModalBookingActions(App, Router) {
        document.querySelector('[data-action="modal-confirm-booking"]')?.addEventListener('click', async (e) => {
            const bookingId = e.target.closest('[data-id]').dataset.id;
            try {
                const result = await BookingsService.confirm(bookingId);
                if (result.success) {
                    App.showSuccess('Đã xác nhận đặt bàn!');
                    window.closeModal('notificationDetailModal');
                    App.reload();
                }
            } catch (error) {
                App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        });
        
        document.querySelector('[data-action="modal-cancel-booking"]')?.addEventListener('click', async (e) => {
            const bookingId = e.target.closest('[data-id]').dataset.id;
            try {
                const result = await BookingsService.cancel(bookingId);
                if (result.success) {
                    App.showSuccess('Đã hủy đặt bàn!');
                    window.closeModal('notificationDetailModal');
                    App.reload();
                }
            } catch (error) {
                App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        });
        
        document.querySelector('[data-action="modal-checkin-booking"]')?.addEventListener('click', async (e) => {
            const bookingId = e.target.closest('[data-id]').dataset.id;
            try {
                const result = await BookingsService.checkIn(bookingId);
                if (result.success) {
                    App.showSuccess('Đã check-in thành công!');
                    window.closeModal('notificationDetailModal');
                    App.reload();
                }
            } catch (error) {
                App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        });
    },

    async handleMarkRead(notificationId, App) {
        try {
            const result = await NotificationsService.markAsRead(notificationId);
            if (result.success) {
                // Update notification item in list
                const notification = document.querySelector(`[data-notification-id="${notificationId}"]`);
                if (notification) {
                    notification.classList.remove('unread', 'bg-primary-50/50');
                    const unreadDot = notification.querySelector('.bg-primary-500.rounded-full');
                    if (unreadDot) unreadDot.remove();
                    notification.querySelector('[data-action="mark-read"]')?.remove();
                }
                
                // Update header notification if exists
                const headerNoti = document.querySelector(`.notification-dropdown-item[data-notification-id="${notificationId}"]`);
                if (headerNoti) {
                    headerNoti.classList.remove('bg-primary-50/50');
                }
                
                // Update sidebar unread count badge
                this.updateSidebarUnreadCount(-1);
            }
        } catch (error) {
            console.warn('Error marking notification as read:', error);
        }
    },
    
    /**
     * Update sidebar unread count badge (decrement or set specific value)
     */
    updateSidebarUnreadCount(delta = 0) {
        const badge = document.getElementById('sidebarNotifBadge');
        if (badge) {
            const current = parseInt(badge.textContent) || 0;
            const newCount = Math.max(0, current + delta);
            if (newCount === 0) {
                badge.remove();
            } else {
                badge.textContent = newCount;
            }
        }
        
        // Also update header notification badge if exists
        const headerBadge = document.getElementById('headerNotifBadge');
        if (headerBadge) {
            const current = parseInt(headerBadge.textContent) || 0;
            const newCount = Math.max(0, current + delta);
            if (newCount === 0) {
                headerBadge.remove();
            } else {
                headerBadge.textContent = newCount;
            }
        }
    },

    async handleMarkAllRead(App) {
        try {
            const result = await NotificationsService.markAllAsRead();
            if (result.success) {
                App.showSuccess('Đã đánh dấu tất cả là đã đọc!');
                // Wait a bit then reload to show updates
                setTimeout(() => window.location.reload(), 500);
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    },

    async handleDelete(id, App) {
        try {
            const result = await NotificationsService.delete(id);
            if (result.success) {
                // Remove from DOM with animation
                const item = document.querySelector(`.notification-item[data-notification-id="${id}"]`);
                if (item) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(10px) scale(0.95)';
                    setTimeout(() => item.remove(), 300);
                }
            } else {
                 App.showError('Không thể xóa thông báo.');
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra khi xóa.');
        }
    },

    async handleDeleteAll(App) {
        try {
            const result = await NotificationsService.deleteAll();
            if (result.success) {
                App.showSuccess('Đã xóa tất cả thông báo!');
                setTimeout(() => window.location.reload(), 500);
            } else {
                App.showError('Không thể xóa tất cả thông báo.');
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra khi xóa tất cả.');
        }
    }
};
