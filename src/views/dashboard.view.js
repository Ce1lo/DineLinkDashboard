/**
 * Dashboard View
 * Xử lý logic render và sự kiện cho trang Tổng quan
 */
import { OverviewService } from '../services/overview.service.js';
import { BookingsService } from '../services/bookings.service.js';

export const DashboardView = {
    /**
     * Render trang Dashboard
     * @param {Object} App - Reference đến App object
     */
    async render(App) {
        const data = await OverviewService.getOverview();
        await App.renderPage('dashboard', data, true);
        this.bindEvents(App);
    },

    /**
     * Bind các event handlers cho trang Dashboard
     */
    bindEvents(App) {
        // View booking
        document.querySelectorAll('[data-action="viewBooking"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                console.log('View booking:', bookingId);
            });
        });

        // Confirm booking
        document.querySelectorAll('[data-action="confirmBooking"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                try {
                    const result = await BookingsService.confirm(bookingId);
                    if (result?.success) {
                        App.showSuccess('Xác nhận booking thành công!');
                        App.reload();
                    }
                } catch (error) {
                    App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
                }
            });
        });

        // Cancel booking
        document.querySelectorAll('[data-action="cancelBooking"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookingId = btn.dataset.id;
                if (confirm('Bạn có chắc muốn huỷ booking này?')) {
                    try {
                        const result = await BookingsService.cancel(bookingId);
                        if (result?.success) {
                            App.showSuccess('Đã huỷ booking!');
                            App.reload();
                        }
                    } catch (error) {
                        App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
                    }
                }
            });
        });
    }
};
