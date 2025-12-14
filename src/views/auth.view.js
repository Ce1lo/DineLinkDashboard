/**
 * Auth View
 * Xử lý logic render và sự kiện cho các trang xác thực (Login, Register)
 */
import { CONFIG } from '../config.js';
import { AuthService } from '../services/auth.service.js';

export const AuthView = {
    /**
     * Render trang Login
     * @param {Object} App - Reference đến App object
     */
    async renderLogin(App) {
        await App.renderPage('login', {}, false);
        this.bindLoginEvents(App);
    },

    /**
     * Render trang Register Owner
     * @param {Object} App - Reference đến App object
     */
    async renderRegisterOwner(App) {
        await App.renderPage('register-owner', {}, false);
        this.bindRegisterOwnerEvents(App);
    },

    /**
     * Render trang Register Staff
     * @param {Object} App - Reference đến App object
     */
    async renderRegisterStaff(App) {
        await App.renderPage('register-staff', {}, false);
        this.bindRegisterStaffEvents(App);
    },

    /**
     * Render trang Register Pending (chờ duyệt)
     * @param {Object} App - Reference đến App object
     */
    async renderRegisterPending(App) {
        await App.renderPage('register-pending', {}, false);
    },

    /**
     * Render trang Forgot Password (quên mật khẩu)
     * @param {Object} App - Reference đến App object
     */
    async renderForgotPassword(App) {
        await App.renderPage('forgot-password', {}, false);
        this.bindForgotPasswordEvents(App);
    },

    /**
     * Bind events cho trang Forgot Password
     */
    bindForgotPasswordEvents(App) {
        const form = document.getElementById('forgotPasswordForm');
        const successDiv = document.getElementById('forgotPasswordSuccess');
        const resendBtn = document.getElementById('resendEmailBtn');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleForgotPassword(form, App);
            });
        }

        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                // Reset to form view
                if (form) form.classList.remove('hidden');
                if (successDiv) successDiv.classList.add('hidden');
            });
        }
    },

    /**
     * Xử lý yêu cầu quên mật khẩu
     */
    async handleForgotPassword(form, App) {
        const email = form.querySelector('input[name="email"]').value;

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            
            // Call API (mock for now - just show success)
            const result = await AuthService.forgotPassword(email);
            
            if (result.success) {
                // Hide form, show success
                form.classList.add('hidden');
                document.getElementById('forgotPasswordSuccess').classList.remove('hidden');
            } else {
                App.showError(result.message || 'Không tìm thấy email này trong hệ thống');
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    /**
     * Bind events cho trang Login
     */
    bindLoginEvents(App) {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(form, App);
            });
        }
    },

    /**
     * Bind events cho trang Register Owner
     */
    bindRegisterOwnerEvents(App) {
        const form = document.getElementById('registerOwnerForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegisterOwner(form, App);
            });
        }
        
        // Expose goToStep to global scope for onclick handlers
        window.goToStep = function(step) {
            // Validate Step 1 before going to Step 2
            if (step === 2) {
                const restaurantName = document.getElementById('restaurantName')?.value.trim();
                const address = document.getElementById('address')?.value.trim();
                const phone = document.getElementById('phone')?.value.trim();
                
                let errors = [];
                if (!restaurantName) errors.push('Vui lòng nhập tên nhà hàng');
                if (!address) errors.push('Vui lòng nhập địa chỉ');
                if (!phone) errors.push('Vui lòng nhập số điện thoại');
                
                if (errors.length > 0) {
                    App.showError(errors.join('<br>'));
                    return;
                }
            }
            
            document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));
            document.getElementById('step' + step)?.classList.remove('hidden');
            
            // Update indicators
            const step2 = document.getElementById('step2-indicator');
            if (step2) {
                const stepNumber = step2.querySelector('.step-number');
                const stepLabel = step2.querySelector('.step-label');
                
                if (step === 2) {
                    stepNumber?.classList.remove('bg-stone-200', 'text-stone-500');
                    stepNumber?.classList.add('bg-primary-500', 'text-white');
                    stepLabel?.classList.remove('text-stone-400');
                    stepLabel?.classList.add('text-stone-700');
                } else {
                    stepNumber?.classList.add('bg-stone-200', 'text-stone-500');
                    stepNumber?.classList.remove('bg-primary-500', 'text-white');
                    stepLabel?.classList.add('text-stone-400');
                    stepLabel?.classList.remove('text-stone-700');
                }
            }
        };
        
        // Expose togglePassword to global scope for onclick handlers
        window.togglePassword = function(inputId, iconId) {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        };
    },

    /**
     * Bind events cho trang Register Staff
     */
    bindRegisterStaffEvents(App) {
        const form = document.getElementById('registerStaffForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegisterStaff(form, App);
            });
        }
    },

    /**
     * Xử lý đăng nhập
     */
    async handleLogin(form, App) {
        const email = form.email.value;
        const password = form.password.value;
        const rememberMe = form.rememberMe?.checked;

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await AuthService.login(email, password);
            
            if (result.token || result.accessToken) {
                if (rememberMe) {
                    localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER_ME, 'true');
                }
                window.location.pathname = '/dashboard';
            } else {
                App.showError('Email hoặc mật khẩu không đúng');
            }
        } catch (error) {
            App.showError('Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    /**
     * Xử lý đăng ký chủ nhà hàng
     */
    async handleRegisterOwner(form, App) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (data.password !== data.confirmPassword) {
            App.showError('Mật khẩu nhập lại không khớp');
            return;
        }

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await AuthService.registerOwner(data);
            
            if (result.success) {
                App.showSuccess(result.message || 'Đăng ký thành công!');
                if (result.token) {
                    setTimeout(() => { window.location.pathname = '/dashboard'; }, 1500);
                } else {
                    setTimeout(() => { window.location.pathname = '/login'; }, 2000);
                }
            }
        } catch (error) {
            App.showError('Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    },

    /**
     * Xử lý đăng ký nhân viên
     */
    async handleRegisterStaff(form, App) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (data.password !== data.confirmPassword) {
            App.showError('Mật khẩu nhập lại không khớp');
            return;
        }

        try {
            App.showLoading(form.querySelector('button[type="submit"]'));
            const result = await AuthService.registerStaff(data);
            
            if (result.success) {
                // Navigate to pending page instead of just showing toast
                window.location.pathname = '/register-pending';
            }
        } catch (error) {
            let message = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            // Handle Joi validation errors
            // Backend returns: { success: false, error: { details: [...] } }
            const details = error.data?.error?.details || error.data?.details;
            
            if (details && Array.isArray(details)) {
                message = details
                    .map(d => d.message.replace(/"/g, '')) // Remove quotes
                    .join('<br>');
            }
            App.showError(message);
        } finally {
            App.hideLoading(form.querySelector('button[type="submit"]'));
        }
    }
};
