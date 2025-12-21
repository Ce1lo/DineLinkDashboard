/**
 * Profile View
 * Xử lý logic render và sự kiện cho trang Thông tin cá nhân
 */
import { ProfileService } from '../services/profile.service.js';
import { AuthService } from '../services/auth.service.js';
import { CONFIG } from '../config.js';

export const ProfileView = {
    async render(App) {
        const data = await ProfileService.getProfile();
        await App.renderPage('profile', data, true);
        this.bindEvents(App);
    },

    bindEvents(App) {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUpdateProfile(profileForm, App);
            });
        }

        const passwordForm = document.getElementById('changePasswordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleChangePassword(passwordForm, App);
            });
        }

        const avatarUpload = document.getElementById('avatarUpload');
        if (avatarUpload) {
            avatarUpload.addEventListener('change', async (e) => {
                await this.handleUploadAvatar(e.target.files[0], App);
            });
        }
    },

    async handleUpdateProfile(form, App) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await ProfileService.update(data);
            if (result.success) {
                App.showSuccess('Cập nhật thông tin thành công!');
                AuthService.updateStoredUser(result.data);
            }
        } catch (error) {
            App.showError('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    async handleChangePassword(form, App) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.newPassword !== data.confirmNewPassword) {
            App.showError('Mật khẩu mới không khớp!');
            return;
        }

        if (data.newPassword.length < 6) {
            App.showError('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await ProfileService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            if (result.success) {
                App.showSuccess('Đổi mật khẩu thành công!');
                form.reset();
                window.closeModal('changePasswordModal');
            }
        } catch (error) {
            App.showError(error.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    async handleUploadAvatar(file, App) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            App.showError('Vui lòng chọn file ảnh!');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            App.showError('File ảnh không được vượt quá 5MB!');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const result = await ProfileService.uploadAvatar(formData);
            if (result.success) {
                App.showSuccess('Cập nhật ảnh đại diện thành công!');
                const avatarPath = result.data?.path || result.data?.url || result.avatarUrl;
                if (avatarPath) {
                    // Normalize URL: prepend API_BASE_URL for relative paths
                    const avatarUrl = avatarPath.startsWith('http') 
                        ? avatarPath 
                        : `${CONFIG.API_BASE_URL}${avatarPath}`;
                    const avatarImg = document.getElementById('avatarPreview');
                    if (avatarImg) avatarImg.src = avatarUrl;
                    AuthService.updateStoredUser({ avatar_url: avatarPath });
                }
            }
        } catch (error) {
            App.showError('Upload ảnh thất bại. Vui lòng thử lại.');
        }
    }
};
