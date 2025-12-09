/**
 * Notifications View
 * Xử lý logic render và sự kiện cho trang Thông báo
 */
import { NotificationsService } from '../services/notifications.service.js';

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
                
                await this.handleMarkRead(notificationId, App);
                
                switch (type) {
                    case 'BOOKING_CREATED':
                    case 'BOOKING_CONFIRMED':
                    case 'BOOKING_CANCELLED':
                        Router.navigate('/bookings');
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
