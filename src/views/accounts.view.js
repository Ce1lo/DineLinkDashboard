/**
 * Accounts View
 * Xử lý logic render và sự kiện cho trang Quản lý tài khoản
 */
import { AccountsService } from '../services/accounts.service.js';

export const AccountsView = {
    async render(App) {
        const [pending, accounts] = await Promise.all([
            AccountsService.getPending(),
            AccountsService.getList()
        ]);
        await App.renderPage('accounts', { 
            pending: pending.data, 
            accounts: accounts.data 
        }, true);
        this.bindEvents(App);
    },

    bindEvents(App) {
        window.switchAccountTab = function(tab) {
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active', 'border-primary-500', 'text-primary-600');
                b.classList.add('border-transparent', 'text-stone-500');
            });
            const panel = document.getElementById(tab + '-panel');
            if (panel) panel.classList.remove('hidden');
            const btn = document.getElementById(tab + '-tab');
            if (btn) {
                btn.classList.add('active', 'border-primary-500', 'text-primary-600');
                btn.classList.remove('border-transparent', 'text-stone-500');
            }
        };
        
        document.querySelectorAll('[data-action="approve-account"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const accountId = e.target.dataset.accountId;
                await this.handleApprove(accountId, App);
            });
        });

        document.querySelectorAll('[data-action="reject-account"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const accountId = e.target.dataset.accountId;
                await this.handleReject(accountId, App);
            });
        });

        document.querySelectorAll('[data-action="toggle-account"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const accountId = e.target.dataset.accountId;
                const currentStatus = e.target.dataset.currentStatus;
                await this.handleToggle(accountId, currentStatus, App);
            });
        });

        document.querySelectorAll('[data-action="change-role"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const accountId = e.target.dataset.accountId;
                const newRole = e.target.dataset.newRole;
                await this.handleChangeRole(accountId, newRole, App);
            });
        });
    },

    async handleApprove(accountId, App) {
        try {
            const result = await AccountsService.approve(accountId);
            if (result.success) {
                App.showSuccess('Đã duyệt tài khoản!');
                App.reload();
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    },

    async handleReject(accountId, App) {
        const reason = prompt('Nhập lý do từ chối (tùy chọn):');
        try {
            const result = await AccountsService.reject(accountId, reason);
            if (result.success) {
                App.showSuccess('Đã từ chối tài khoản!');
                App.reload();
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    },

    async handleToggle(accountId, currentStatus, App) {
        const isActive = currentStatus === 'ACTIVE';
        const action = isActive ? 'vô hiệu hóa' : 'kích hoạt lại';
        
        if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

        try {
            const result = isActive 
                ? await AccountsService.deactivate(accountId)
                : await AccountsService.activate(accountId);
            if (result.success) {
                App.showSuccess(`Đã ${action} tài khoản!`);
                App.reload();
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    },

    async handleChangeRole(accountId, newRole, App) {
        if (!confirm(`Bạn có chắc muốn đổi vai trò thành ${newRole}?`)) return;
        try {
            const result = await AccountsService.changeRole(accountId, newRole);
            if (result.success) {
                App.showSuccess('Đã thay đổi vai trò!');
                App.reload();
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    }
};
