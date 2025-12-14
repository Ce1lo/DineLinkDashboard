/**
 * Accounts View
 * Xử lý logic render và sự kiện cho trang Quản lý tài khoản
 */
import { AccountsService } from '../services/accounts.service.js';

export const AccountsView = {
    async render(App, Router) {
        // Get params from Router/URL to handle pagination if needed
        const params = Router.getQueryParams(); 
        const [pending, accounts] = await Promise.all([
            AccountsService.getPending(),
            AccountsService.getList(params)
        ]);
        // Normalize data
        const pendingData = pending.data || {};
        const accountsData = accounts.data || {};
        
        const pendingList = Array.isArray(pendingData) ? pendingData : (pendingData.items || []);
        let accountsList = Array.isArray(accountsData) ? accountsData : (accountsData.items || []);
        
        // Filter out pending invites from the main list to avoid duplication/locked status confusion
        accountsList = accountsList.filter(s => s.status !== 'INVITED' && s.status !== 'PENDING');
        const pagination = accountsData.pagination || {};

        await App.renderPage('accounts', { 
            pending: pendingList, 
            accounts: accountsList,
            pagination
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

        window.changePage = (page) => {
            // Determine which tab is active (pending or staff) to paginate correctly?
            // Actually, list logic might usually be for the main list (staff). 
            // If Pending list needs pagination, it's complex. 
            // Assuming pagination is for the Staff list as usually "Accounts" refers to existing staff.
            // But let's check templates: Pagination block was added to main body (Staff tab part?)
            // In accounts.hbs, pagination block is inside #staff-panel div (inferred by placement after table)
            // So we just update page params. 
            // AccountsService.getList(params) likely handles ?page=...
            
            const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
            params.set('page', page);
            Router.navigate(`/accounts?${params.toString()}`);
        };
        
        document.querySelectorAll('[data-action="approve-account"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target.closest('[data-action="approve-account"]');
                const accountId = button.dataset.accountId;
                await this.handleApprove(accountId, App);
            });
        });

        document.querySelectorAll('[data-action="reject-account"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target.closest('[data-action="reject-account"]');
                const accountId = button.dataset.accountId;
                await this.handleReject(accountId, App);
            });
        });

        document.querySelectorAll('[data-action="toggle-account"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target.closest('[data-action="toggle-account"]');
                const accountId = button.dataset.accountId;
                const currentStatus = button.dataset.currentStatus;
                await this.handleToggle(accountId, currentStatus, App);
            });
        });

        document.querySelectorAll('[data-action="change-role"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('[data-action="change-role"]');
                const accountId = button.dataset.accountId;
                const currentRole = button.dataset.currentRole;
                const accountName = button.dataset.accountName;
                this.showChangeRoleModal(accountId, currentRole, accountName, App);
            });
        });
    },

    showChangeRoleModal(accountId, currentRole, accountName, App) {
        document.getElementById('changeRoleAccountId').value = accountId;
        document.getElementById('changeRoleAccountName').textContent = accountName;
        
        // Reset all radio buttons and enable them
        document.querySelectorAll('input[name="newRole"]').forEach(radio => {
            radio.checked = false;
            radio.disabled = false;
            radio.closest('label').classList.remove('opacity-50', 'cursor-not-allowed', 'bg-stone-100');
        });
        
        // Disable and mark current role
        const currentRoleRadio = document.querySelector(`input[name="newRole"][value="${currentRole}"]`);
        if (currentRoleRadio) {
            currentRoleRadio.disabled = true;
            currentRoleRadio.closest('label').classList.add('opacity-50', 'cursor-not-allowed', 'bg-stone-100');
        }
        
        window.openModal('changeRoleModal');
        
        // Bind confirm button
        const confirmBtn = document.getElementById('confirmChangeRoleBtn');
        const newConfirmBtn = confirmBtn.cloneNode(true); // Remove old listeners
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', () => this.handleConfirmChangeRole(App));
    },

    async handleConfirmChangeRole(App) {
        const accountId = document.getElementById('changeRoleAccountId').value;
        const selectedRole = document.querySelector('input[name="newRole"]:checked');
        
        if (!selectedRole) {
            App.showError('Vui lòng chọn vai trò mới');
            return;
        }
        
        const newRole = selectedRole.value;
        await this.handleChangeRole(accountId, newRole, App);
        window.closeModal('changeRoleModal');
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
                
                // Update DOM directly instead of full reload
                const button = document.querySelector(`button[data-account-id="${accountId}"][data-action="toggle-account"]`);
                if (button) {
                    const newStatus = isActive ? 'INACTIVE' : 'ACTIVE';
                    button.dataset.currentStatus = newStatus;
                    
                    // Update button appearance
                    if (newStatus === 'ACTIVE') {
                        button.innerHTML = '<i class="fa-solid fa-lock"></i><span>Khoá</span>';
                        button.title = 'Khoá';
                    } else {
                        button.innerHTML = '<i class="fa-solid fa-unlock"></i><span>Mở</span>';
                        button.title = 'Mở khoá';
                    }
                    
                    // Update status badge in the same row
                    const row = button.closest('tr');
                    if (row) {
                        const statusCell = row.cells[2]; // Status is 3rd column
                        if (statusCell) {
                            if (newStatus === 'ACTIVE') {
                                statusCell.innerHTML = '<span class="badge badge-confirmed">Hoạt động</span>';
                            } else {
                                statusCell.innerHTML = '<span class="badge badge-no-show">Tạm khoá</span>';
                            }
                        }
                    }
                }
            }
        } catch (error) {
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    },

    async handleChangeRole(accountId, newRole, App) {
        try {
            const result = await AccountsService.changeRole(accountId, newRole);
            if (result.success) {
                App.showSuccess('Đã thay đổi vai trò!');
                
                // Update DOM directly to avoid page reload and tab switch
                const button = document.querySelector(`button[data-account-id="${accountId}"][data-action="change-role"]`);
                if (button) {
                    // Update button data attribute
                    button.dataset.currentRole = newRole;

                    // Update Badge in the 2nd column
                    const row = button.closest('tr');
                    const badgeCell = row.cells[1];
                    if (badgeCell) {
                        badgeCell.innerHTML = this.getRoleBadge(newRole);
                    }
                }
            }
        } catch (error) {
            console.error('Change role error:', error);
            App.showError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    },

    getRoleBadge(role) {
        if (role === 'OWNER') {
            return `
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    <i class="fa-solid fa-crown"></i>
                    Chủ sở hữu
                </span>`;
        } else if (role === 'MANAGER') {
            return `
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <i class="fa-solid fa-briefcase"></i>
                    Quản lý
                </span>`;
        } else {
            return `
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-sm font-medium">
                    <i class="fa-solid fa-user"></i>
                    Nhân viên
                </span>`;
        }
    }
};
