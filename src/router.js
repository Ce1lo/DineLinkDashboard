/**
 * SPA Router - Điều hướng dựa trên History API
 * Ví dụ: yoursite.com/dashboard, yoursite.com/bookings
 */
import { CONFIG } from './config.js';
import { AuthService } from './services/auth.service.js';

// App reference will be set during init
let _app = null;

export const Router = {
    routes: {},
    currentRoute: null,

    /**
     * Set App reference for router
     */
    setApp(app) {
        _app = app;
    },

    /**
     * Đăng ký một route mới
     */
    register(path, handler) {
        this.routes[path] = handler;
    },

    /**
     * Chuyển hướng đến một route
     */
    navigate(path) {
        history.pushState({}, '', path);
        this.handleRoute();
    },

    /**
     * Lấy đường dẫn hiện tại từ URL
     */
    getCurrentPath() {
        const path = window.location.pathname || '/';
        return path.split('?')[0];
    },

    /**
     * Lấy query parameters từ URL hiện tại
     */
    getQueryParams() {
        const searchStr = window.location.search;
        if (!searchStr) return {};
        
        const params = {};
        const urlParams = new URLSearchParams(searchStr);
        
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        
        return params;
    },

    /**
     * Lấy route params (tham số động trong URL)
     */
    getRouteParams(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');
        const params = {};

        routeParts.forEach((part, i) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = actualParts[i];
            }
        });

        return params;
    },

    /**
     * Tìm route phù hợp với đường dẫn (hỗ trợ params động)
     */
    matchRoute(path) {
        if (this.routes[path]) {
            return { handler: this.routes[path], params: {} };
        }

        for (const routePath in this.routes) {
            if (routePath.includes(':')) {
                const routeParts = routePath.split('/');
                const pathParts = path.split('/');

                if (routeParts.length === pathParts.length) {
                    let match = true;
                    for (let i = 0; i < routeParts.length; i++) {
                        if (!routeParts[i].startsWith(':') && routeParts[i] !== pathParts[i]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        return {
                            handler: this.routes[routePath],
                            params: this.getRouteParams(routePath, path)
                        };
                    }
                }
            }
        }

        return null;
    },

    /**
     * Xử lý khi route thay đổi
     */
    async handleRoute() {
        const path = this.getCurrentPath();
        const queryParams = this.getQueryParams();

        if (!CONFIG.PUBLIC_ROUTES.includes(path) && !AuthService.isAuthenticated()) {
            this.navigate('/login');
            return;
        }

        if (path === '/login' && AuthService.isAuthenticated()) {
            this.navigate('/dashboard');
            return;
        }

        if (path === '/' || path === '') {
            this.navigate(AuthService.isAuthenticated() ? '/dashboard' : '/login');
            return;
        }

        const match = this.matchRoute(path);
        if (match) {
            this.currentRoute = path;
            try {
                await match.handler({ ...match.params, ...queryParams });
            } catch (error) {
                console.error('Lỗi khi xử lý route:', error);
                if (_app) _app.showError('Có lỗi xảy ra khi tải trang');
            }
        } else {
            this.navigate(AuthService.isAuthenticated() ? '/dashboard' : '/login');
        }
    },

    /**
     * Khởi tạo Router
     */
    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }
};
