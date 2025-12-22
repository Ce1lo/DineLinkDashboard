/**
 * Ứng dụng chính (Main Application)
 * Đây là trung tâm điều khiển của ứng dụng SPA
 * Quản lý: templates, routes, render, events, thông báo
 */

// Core imports
import { registerHandlebarsHelpers } from './utils/helpers.js';
import { Router } from './router.js';

// Service imports
import { AuthService } from './services/auth.service.js';
import { OverviewService } from './services/overview.service.js';
import { NotificationsService } from './services/notifications.service.js';
import { BookingsService } from './services/bookings.service.js';
import { TablesService } from './services/tables.service.js';
import { AccountsService } from './services/accounts.service.js';
import { CONFIG } from './config.js';

// View imports
import { AuthView } from './views/auth.view.js';
import { DashboardView } from './views/dashboard.view.js';
import { BookingsView } from './views/bookings.view.js';
import { TablesView } from './views/tables.view.js';
import { ImagesView } from './views/images.view.js';
import { ReviewsView } from './views/reviews.view.js';
import { NotificationsView } from './views/notifications.view.js';
import { RestaurantView } from './views/restaurant.view.js';
import { AccountsView } from './views/accounts.view.js';
import { ProfileView } from './views/profile.view.js';
import { HeaderView } from './views/header.view.js';

const App = {
    templates: {},
    container: null,

    async init() {
        console.log('Đang khởi tạo Restaurant Dashboard...');
        
        this.container = document.getElementById('app');
        
        registerHandlebarsHelpers();
        
        await this.loadTemplates();
        
        this.setupRoutes();
        
        // Set App reference in Router
        Router.setApp(this);
        Router.init();
        
        this.setupEventListeners();
        
        this.registerGlobalUtilities();
        
        console.log('Ứng dụng khởi tạo thành công!');
    },
    
    registerGlobalUtilities() {
        window.openModal = function(id) {
            const modal = document.getElementById(id);
            if (modal) modal.classList.remove('hidden');
        };
        
        window.closeModal = function(id) {
            const modal = document.getElementById(id);
            if (modal) modal.classList.add('hidden');
        };
        
        window.togglePassword = function(inputId, iconId) {
            const input = document.getElementById(inputId);
            if (!input) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                if (iconId) {
                    const icon = document.getElementById(iconId);
                    if (icon) {
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    }
                }
            } else {
                input.type = 'password';
                if (iconId) {
                    const icon = document.getElementById(iconId);
                    if (icon) {
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                }
            }
        };
        
        window.toggleSidebar = function() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (sidebar && overlay) {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('hidden');
            }
        };
    },

    async loadTemplates() {
        const templateFiles = [
            'layouts/main',
            'layouts/auth',
            'partials/sidebar',
            'partials/header',
            'pages/login',
            'pages/register-owner',
            'pages/register-staff',
            'pages/register-pending',
            'pages/forgot-password',
            'pages/dashboard',
            'pages/bookings',
            'pages/tables',
            'pages/images',
            'pages/reviews',
            'pages/notifications',
            'pages/restaurant',
            'pages/accounts',
            'pages/profile'
        ];

        for (const file of templateFiles) {
            try {
                const response = await fetch(`templates/${file}.hbs`);
                if (response.ok) {
                    const templateStr = await response.text();
                    const name = file.split('/').pop();
                    this.templates[name] = Handlebars.compile(templateStr);
                    
                    if (file.includes('partials/') || file.includes('layouts/')) {
                        Handlebars.registerPartial(name, templateStr);
                    }
                }
            } catch (error) {
                console.warn(`Không thể tải template: ${file}`, error);
            }
        }
    },

    setupRoutes() {
        Router.register('/login', () => AuthView.renderLogin(this));
        Router.register('/register-owner', () => AuthView.renderRegisterOwner(this));
        Router.register('/register-staff', () => AuthView.renderRegisterStaff(this));
        Router.register('/register-pending', () => AuthView.renderRegisterPending(this));
        Router.register('/forgot-password', () => AuthView.renderForgotPassword(this));
        Router.register('/dashboard', () => this.renderDashboard());
        Router.register('/bookings', () => this.renderBookings());
        Router.register('/tables', () => this.renderTables());
        Router.register('/images', () => this.renderImages());
        Router.register('/reviews', () => this.renderReviews());
        Router.register('/notifications', () => this.renderNotifications());
        Router.register('/restaurant', () => this.renderRestaurant());
        Router.register('/accounts', () => this.renderAccounts());
        Router.register('/profile', () => this.renderProfile());
    },

    async renderPage(pageName, data = {}, useMainLayout = false) {
        const layout = useMainLayout ? 'main' : 'auth';
        const user = AuthService.getStoredUser();
        
        // Normalize user avatar URL for sidebar
        if (user) {
            const avatarPath = user.avatar_url || user.avatar;
            if (avatarPath && !avatarPath.startsWith('http')) {
                user.avatar = `${CONFIG.API_BASE_URL}${avatarPath}`;
            } else {
                user.avatar = avatarPath;
            }
        }
        
        const pageTemplate = this.templates[pageName];
        if (!pageTemplate) {
            console.error(`Không tìm thấy template: ${pageName}`);
            return;
        }
        
        const pageContent = pageTemplate(data);
        
        const layoutTemplate = this.templates[layout];
        if (layoutTemplate) {
            let sidebarData = {};
            if (useMainLayout) {
                try {
                    if (!data.kpis) {
                        const overviewData = await OverviewService.getOverview();
                        sidebarData.kpis = overviewData.kpis;
                    }
                    const notifResult = await NotificationsService.getList();
                    let notificationsList = [];
                    
                    // Helper to check if notification is unread (handles both snake_case and camelCase)
                    const isUnread = (n) => !(n.is_read || n.isRead);
                    
                    if (Array.isArray(notifResult)) {
                        notificationsList = notifResult;
                        sidebarData.unreadCount = notifResult.filter(isUnread).length;
                    } else if (notifResult && notifResult.data) {
                        // Handle { data: { items: [] } } or { data: [] }
                        const nData = notifResult.data;
                        if (Array.isArray(nData)) {
                             notificationsList = nData;
                             sidebarData.unreadCount = nData.filter(isUnread).length;
                        } else if (nData.items) {
                             notificationsList = nData.items;
                             // Use unread_count from API if available, else count manually
                             sidebarData.unreadCount = (typeof nData.unread_count !== 'undefined') 
                                ? nData.unread_count 
                                : nData.items.filter(isUnread).length;
                        }
                    } else if (notifResult && typeof notifResult.unreadCount !== 'undefined') {
                        sidebarData.unreadCount = notifResult.unreadCount;
                    } else {
                        sidebarData.unreadCount = 0;
                    }
                    // Pass recent notifications for header dropdown (latest 5)
                    // Map API fields (snake_case) to template fields (camelCase)
                    // Handle target_type/target_id like notifications view
                    sidebarData.recentNotifications = notificationsList.slice(0, 5).map(n => {
                        // Debug: Log raw notification to see what fields backend returns
                        console.log('🔔 [Raw Notification]', n);
                        
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
                            content: n.message || n.content,
                            isRead: n.is_read || n.isRead,
                            bookingId,
                            reviewId,
                            accountId
                        };
                    });
                    
                    // Fetch booking counts for sidebar badge (limit 10 to avoid BE validation error)
                    try {
                        const bookingsResult = await BookingsService.getList({ limit: 10 });
                        // BE data struct: { items: [...] }
                        const bookingsData = bookingsResult.data || {};
                        const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.items || []);
                        
                        sidebarData.pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
                        sidebarData.confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
                    } catch (e) { console.warn('Could not fetch bookings:', e); }
                    
                    // Fetch available tables count (with high limit to get all tables)
                    try {
                        const tablesResult = await TablesService.getList({ limit: 100 });
                        // BE data struct: { items: [...] }
                        const tablesData = tablesResult.data || {};
                        const tables = Array.isArray(tablesData) ? tablesData : (tablesData.items || []);
                        
                        sidebarData.availableTables = tables.filter(t => t.status === 'ACTIVE').length;
                    } catch (e) { console.warn('Could not fetch tables:', e); }
                    
                    // Fetch pending staff count (Only for OWNER)
                    if (user && user.role === 'OWNER') {
                        try {
                            const pendingResult = await AccountsService.getPending();
                            const pending = pendingResult.data || [];
                            sidebarData.pendingStaff = pending.length;
                        } catch (e) { console.warn('Could not fetch pending staff:', e); }
                    }
                } catch (e) {
                    console.warn('Could not fetch sidebar data:', e);
                    sidebarData.unreadCount = 0;
                    sidebarData.recentNotifications = [];
                }
            }
            
            const layoutData = {
                ...data,
                ...sidebarData,
                user,
                content: pageContent,
                currentRoute: Router.getCurrentPath()
            };
            this.container.innerHTML = layoutTemplate(layoutData);
            // Initialize Header Search after rendering main layout
            HeaderView.init(this, Router);
        } else {
            this.container.innerHTML = pageContent;
        }
    },

    async renderDashboard() {
        await DashboardView.render(this);
    },

    async renderBookings() {
        await BookingsView.render(this, Router);
    },

    async renderTables() {
        await TablesView.render(this, Router);
    },

    async renderImages() {
        await ImagesView.render(this);
    },

    async renderReviews() {
        await ReviewsView.render(this, Router);
    },

    async renderNotifications() {
        await NotificationsView.render(this, Router);
    },

    async renderRestaurant() {
        await RestaurantView.render(this);
    },

    async renderAccounts() {
        await AccountsView.render(this, Router);
    },

    async renderProfile() {
        await ProfileView.render(this);
    },

    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            // Handle logout - show confirmation modal
            const logoutBtn = e.target.closest('[data-action="logout"]');
            if (logoutBtn) {
                e.preventDefault();
                window.openModal('logoutModal');
                // Bind confirm button
                const confirmBtn = document.getElementById('confirmLogoutBtn');
                if (confirmBtn) {
                    const newBtn = confirmBtn.cloneNode(true);
                    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
                    newBtn.addEventListener('click', () => {
                        window.closeModal('logoutModal');
                        AuthService.logout();
                    });
                }
            }

            // Handle navigation - use closest to capture clicks on child elements
            const navBtn = e.target.closest('[data-nav]');
            if (navBtn) {
                e.preventDefault();
                const path = navBtn.dataset.nav;
                Router.navigate(path);
            }
            
            // Handle header notification click - show modal like notifications page
            const headerNotifItem = e.target.closest('[data-action="header-notification-click"]');
            if (headerNotifItem) {
                e.preventDefault();
                const type = headerNotifItem.dataset.type;
                const notificationId = headerNotifItem.dataset.notificationId;
                const bookingId = headerNotifItem.dataset.bookingId;
                const reviewId = headerNotifItem.dataset.reviewId;
                const accountId = headerNotifItem.dataset.accountId;
                
                // Debug log to trace notification data
                console.log('🔔 [Header Notification Click]', {
                    type,
                    notificationId,
                    bookingId,
                    reviewId,
                    accountId,
                    rawDataset: headerNotifItem.dataset
                });
                
                // Use NotificationsView's modal function
                await NotificationsView.showNotificationDetailModal(
                    type,
                    { notificationId, bookingId, reviewId, accountId },
                    this,
                    Router
                );
            }
        });
    },

    showLoading(button) {
        if (button) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
        }
    },

    hideLoading(button) {
        if (button) {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || 'Submit';
        }
    },

    showError(message) {
        this.showToast(message, 'danger');
    },

    showSuccess(message) {
        this.showToast(message, 'success');
    },

    showWarning(message) {
        this.showToast(message, 'warning');
    },

    showToast(message, type = 'info') {
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
            document.body.appendChild(toastContainer);
        }

        const colors = {
            success: 'bg-green-500',
            danger: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        const icons = {
            success: 'fa-circle-check',
            danger: 'fa-circle-exclamation',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };

        const toastId = 'toast_' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-[400px] transform translate-x-full transition-transform duration-300 ease-out`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type] || icons.info}"></i>
            <span class="flex-1 text-sm">${message}</span>
            <button class="text-white/70 hover:text-white transition-colors" onclick="this.closest('.toast-item')?.remove() || this.parentElement.remove()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        toast.classList.add('toast-item');
        
        toastContainer.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        });
        
        setTimeout(() => {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    reload() {
        Router.handleRoute();
    }
};

// ==================== KHỞI ĐỘNG ỨNG DỤNG ====================
document.addEventListener('DOMContentLoaded', () => App.init());
