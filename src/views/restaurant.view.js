/**
 * Restaurant View
 * Xử lý logic render và sự kiện cho trang Thông tin nhà hàng
 */
import { RestaurantService } from '../services/restaurant.service.js';

export const RestaurantView = {
    async render(App) {
        const restaurantData = await RestaurantService.getInfo();
        // Service already returns response.data, so we don't need to access .data again unless it's double wrapped
        // But let's be safe: if restaurantData has a 'data' property that is an object, use it.
        // Otherwise use restaurantData itself.
        const finalData = (restaurantData && restaurantData.data) ? restaurantData.data : restaurantData;
        
        // Normalize fields for template
        if (finalData) {
            finalData.requireDeposit = finalData.require_deposit;
            finalData.defaultDeposit = finalData.default_deposit_amount;
            finalData.averageRating = finalData.average_rating;
            finalData.reviewCount = finalData.review_count;
        }

        await App.renderPage('restaurant', finalData, true);
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
        const showConfirmBtn = document.getElementById('showConfirmUpdateBtn');
        const confirmUpdateBtn = document.getElementById('confirmUpdateBtn');
        
        // Show confirmation modal when "Lưu thay đổi" is clicked
        if (showConfirmBtn) {
            showConfirmBtn.addEventListener('click', () => {
                // Validate form first
                if (infoForm && infoForm.checkValidity()) {
                    window.openModal('confirmUpdateModal');
                } else if (infoForm) {
                    // Trigger browser's native validation
                    infoForm.reportValidity();
                }
            });
        }
        
        // Handle confirmed update
        if (confirmUpdateBtn && infoForm) {
            confirmUpdateBtn.addEventListener('click', async () => {
                window.closeModal('confirmUpdateModal');
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

        // Tag input handling - add new tag on Enter
        const tagInput = document.getElementById('tagInput');
        const tagsContainer = document.getElementById('tagsContainer');
        if (tagInput && tagsContainer) {
            tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const tagValue = tagInput.value.trim();
                    if (tagValue) {
                        // Check if tag already exists
                        const existingTags = Array.from(tagsContainer.querySelectorAll('span')).map(s => 
                            s.textContent.trim().replace('×', '').trim().toLowerCase()
                        );
                        if (!existingTags.includes(tagValue.toLowerCase())) {
                            // Create new tag element
                            const tagSpan = document.createElement('span');
                            tagSpan.className = 'inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm';
                            tagSpan.innerHTML = `
                                ${tagValue}
                                <button type="button" class="hover:text-primary-900" onclick="removeTag(this)">
                                    ×
                                </button>
                            `;
                            tagsContainer.appendChild(tagSpan);
                            window.updateTagsValue();
                            tagInput.value = '';
                        } else {
                            App.showWarning('Tag này đã tồn tại!');
                            tagInput.value = '';
                        }
                    }
                }
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
