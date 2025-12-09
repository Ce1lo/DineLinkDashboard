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
