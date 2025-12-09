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
                    if (Array.isArray(notifResult)) {
                        sidebarData.unreadCount = notifResult.filter(n => !n.isRead).length;
                    } else if (notifResult && typeof notifResult.unreadCount !== 'undefined') {
                        sidebarData.unreadCount = notifResult.unreadCount;
                    } else if (notifResult && notifResult.data) {
                        sidebarData.unreadCount = notifResult.data.filter(n => !n.isRead).length;
                    } else {
                        sidebarData.unreadCount = 0;
                    }
                } catch (e) {
                    console.warn('Could not fetch sidebar data:', e);
                    sidebarData.unreadCount = 0;
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
        await TablesView.render(this);
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
        await AccountsView.render(this);
    },

    async renderProfile() {
        await ProfileView.render(this);
    },

    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            // Handle logout - use closest to capture clicks on child elements (icon/text)
            const logoutBtn = e.target.closest('[data-action="logout"]');
            if (logoutBtn) {
                e.preventDefault();
                AuthService.logout();
            }

            // Handle navigation - use closest to capture clicks on child elements
            const navBtn = e.target.closest('[data-nav]');
            if (navBtn) {
                e.preventDefault();
                const path = navBtn.dataset.nav;
                Router.navigate(path);
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
