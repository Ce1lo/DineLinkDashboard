/**
 * Restaurant View
 * Xử lý logic render và sự kiện cho trang Thông tin nhà hàng
 */
import { RestaurantService } from '../services/restaurant.service.js';

export const RestaurantView = {
    async render(App) {
        const data = await RestaurantService.getInfo();
        await App.renderPage('restaurant', data, true);
        this.bindEvents(App);
    },

    bindEvents(App) {
        window.removeTag = function(btn) {
            btn.parentElement.remove();
            window.updateTagsValue();
        };
        
        window.updateTagsValue = function() {
            const tags = Array.from(document.querySelectorAll('#tagsContainer span')).map(s => 
                s.textContent.trim().replace('×', '').trim()
            );
            const tagsInput = document.getElementById('tagsValue');
            if (tagsInput) tagsInput.value = tags.join(',');
        };
        
        const infoForm = document.getElementById('restaurantInfoForm');
        if (infoForm) {
            infoForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUpdateInfo(infoForm, App);
            });
        }

        const hoursForm = document.getElementById('operatingHoursForm');
        if (hoursForm) {
            hoursForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUpdateHours(hoursForm, App);
            });
        }
    },

    async handleUpdateInfo(form, App) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await RestaurantService.update(data);
            if (result.success) {
                App.showSuccess('Cập nhật thông tin nhà hàng thành công!');
            }
        } catch (error) {
            App.showError('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    async handleUpdateHours(form, App) {
        const formData = new FormData(form);
        const hours = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            hours[day] = {
                open: formData.get(`${day}_open`),
                close: formData.get(`${day}_close`),
                closed: formData.get(`${day}_closed`) === 'on'
            };
        });
        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await RestaurantService.updateHours(hours);
            if (result.success) {
                App.showSuccess('Cập nhật giờ mở cửa thành công!');
            }
        } catch (error) {
            App.showError('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    }
};
