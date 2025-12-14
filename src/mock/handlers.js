/**
 * Mock Handlers - Xử lý mock API responses
 * Trả về data theo format mà FE Dashboard cần
 */
import { MOCK_DATA } from './data.js';

// Current logged in user ID (persisted to localStorage)
const CURRENT_USER_KEY = 'mock_current_user_id';

function getCurrentUserId() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

function setCurrentUserId(id) {
    if (id) {
        localStorage.setItem(CURRENT_USER_KEY, id.toString());
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

// Get current user from MOCK_DATA using stored ID
function getCurrentUser() {
    const userId = getCurrentUserId();
    if (userId) {
        return MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(userId));
    }
    return null;
}

export const MockHandlers = {
    /**
     * Delay để simulate network latency
     */
    delay(ms = 200) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ==================== AUTH ====================
    
    async login(email, password) {
        await this.delay();
        const account = MOCK_DATA.getAccountByEmail(email);
        
        if (!account || account.password !== password) {
            console.error('🔐 Mock login failed: Invalid credentials');
            return { error: 'Email hoặc mật khẩu không đúng' };
        }
        
        if (account.status !== 'ACTIVE') {
            console.error('🔐 Mock login failed: Account not active');
            return { error: 'Tài khoản chưa được kích hoạt' };
        }
        
        const restaurant = MOCK_DATA.restaurants[0];
        setCurrentUserId(account.id); // Persist current user ID
        
        console.log('🔐 Mock login success:', account.email);
        
        // Tạo mock tokens với timestamp để unique
        const timestamp = Date.now();
        const accessToken = `mock_access_token_${account.role.toLowerCase()}_${timestamp}`;
        const refreshToken = `mock_refresh_token_${account.role.toLowerCase()}_${timestamp}`;
        
        return {
            accessToken,
            refreshToken,
            token: accessToken, // Legacy support
            user: {
                id: account.id,
                name: account.full_name,
                email: account.email,
                role: account.role,
                avatar: account.avatar_url,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name
            }
        };
    },

    // ==================== OVERVIEW ====================
    
    async getOverview() {
        await this.delay();
        
        // For mock: show all bookings (không filter theo ngày để demo)
        const allBookings = MOCK_DATA.bookings;
        const pendingBookings = allBookings.filter(b => b.status === 'PENDING');
        const confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED');
        
        // Calculate Guests Today (mock: all confirmed/pending bookings guests)
        const guestsToday = allBookings
            .filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED')
            .reduce((sum, b) => sum + b.people_count, 0);

        // Calculate Total Capacity
        const totalCapacity = MOCK_DATA.restaurantTables.reduce((sum, t) => sum + t.capacity, 0);
        
        // Calculate Occcupancy (Guests / Capacity)
        const tableOccupancy = totalCapacity > 0 ? Math.round((guestsToday / totalCapacity) * 100) : 0;

        // Build upcomingBookings with joined data - lấy tất cả để demo
        const upcomingBookings = allBookings
            .filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED')
            .slice(0, 5)
            .map(b => {
                const user = MOCK_DATA.getUser(b.user_id);
                const table = b.table_id ? MOCK_DATA.getTable(b.table_id) : null;
                const bookingDate = new Date(b.booking_time);
                return {
                    id: b.id,
                    time: bookingDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    date: bookingDate.toLocaleDateString('vi-VN'),
                    customerName: user ? user.display_name : 'Khách',
                    customerPhone: user ? user.phone : '',
                    guests: b.people_count,
                    table: table ? table.name : null,
                    status: b.status
                };
            });
        
        return {
            kpis: {
                bookingsToday: allBookings.length,
                guestsToday: guestsToday,
                pendingBookings: pendingBookings.length,
                tableOccupancy: tableOccupancy
            },
            upcomingBookings,
            restaurant: MOCK_DATA.restaurants[0]
        };
    },

    // ==================== BOOKINGS ====================
    
    async getBookings(params = {}) {
        await this.delay();
        
        let result = MOCK_DATA.bookings.map(b => {
            const user = MOCK_DATA.getUser(b.user_id);
            const table = b.table_id ? MOCK_DATA.getTable(b.table_id) : null;
            return {
                id: b.id,
                code: 'BK' + String(b.id).padStart(3, '0'),
                customerName: user ? user.display_name : 'Khách',
                customerPhone: user ? user.phone : '',
                guests: b.people_count,
                datetime: b.booking_time,
                tableId: b.table_id,
                tableName: table ? table.name : null,
                status: b.status,
                deposit: b.deposit_amount,
                note: b.note
            };
        });
        
        // Filter by status
        if (params.status) {
            result = result.filter(b => b.status === params.status);
        }
        
        // Search by keyword
        if (params.keyword) {
            const kw = params.keyword.toLowerCase();
            result = result.filter(b => 
                b.customerName.toLowerCase().includes(kw) || 
                b.customerPhone.includes(kw) ||
                b.code.toLowerCase().includes(kw)
            );
        }
        
        return { data: result, total: result.length };
    },

    async confirmBooking(id) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(id));
        if (booking) booking.status = 'CONFIRMED';
        MOCK_DATA.saveBookings();
        return { success: true, message: 'Đã xác nhận booking' };
    },

    async cancelBooking(id) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(id));
        if (booking) booking.status = 'CANCELLED';
        MOCK_DATA.saveBookings();
        return { success: true, message: 'Đã hủy booking' };
    },

    async checkInBooking(id) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(id));
        if (booking) booking.status = 'CHECKED_IN';
        MOCK_DATA.saveBookings();
        return { success: true, message: 'Đã check-in' };
    },

    async noShowBooking(id) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(id));
        if (booking) booking.status = 'NO_SHOW';
        MOCK_DATA.saveBookings();
        return { success: true, message: 'Đã đánh dấu no-show' };
    },

    async assignTable(bookingId, tableId) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(bookingId));
        if (booking) booking.table_id = parseInt(tableId);
        MOCK_DATA.saveBookings();
        return { success: true, message: 'Đã gán bàn' };
    },

    // ==================== TABLES ====================
    
    async getTables() {
        await this.delay();
        const data = MOCK_DATA.restaurantTables.map(t => ({
            id: t.id,
            name: t.name,
            capacity: t.capacity,
            area: t.location,  // Map location -> area for FE
            status: t.status,
            viewImage: t.view_image_url,
            viewNote: t.view_note
        }));
        return { data, total: data.length };
    },

    async createTable(data) {
        await this.delay();
        const newId = Math.max(...MOCK_DATA.restaurantTables.map(t => t.id)) + 1;
        const newTable = {
            id: newId,
            restaurant_id: 1,
            name: data.name,
            capacity: parseInt(data.capacity),
            location: data.area || data.location,
            status: data.status || 'ACTIVE',
            view_image_url: null,
            view_note: null
        };
        MOCK_DATA.restaurantTables.push(newTable);
        MOCK_DATA.saveTables();
        return { 
            success: true, 
            message: 'Đã tạo bàn mới', 
            data: { id: newId, ...newTable } 
        };
    },

    async updateTable(id, data) {
        await this.delay();
        const table = MOCK_DATA.restaurantTables.find(t => t.id === parseInt(id));
        if (table) {
            if (data.name) table.name = data.name;
            if (data.capacity) table.capacity = parseInt(data.capacity);
            if (data.area || data.location) table.location = data.area || data.location;
            if (data.status) table.status = data.status;
        }
        MOCK_DATA.saveTables();
        return { success: true, message: 'Đã cập nhật bàn' };
    },

    async deleteTable(id) {
        await this.delay();
        const index = MOCK_DATA.restaurantTables.findIndex(t => t.id === parseInt(id));
        if (index > -1) MOCK_DATA.restaurantTables.splice(index, 1);
        MOCK_DATA.saveTables();
        return { success: true, message: 'Đã xóa bàn' };
    },

    async uploadTableViewImage(tableId, file, description = '') {
        await this.delay();
        const table = MOCK_DATA.restaurantTables.find(t => t.id === parseInt(tableId));
        if (table) {
            // Simulate upload by setting a mock URL
            table.view_image_url = `https://picsum.photos/seed/${tableId}/400/300`;
            table.view_note = description || table.view_note;
        }
        return { 
            success: true, 
            message: 'Đã upload ảnh view bàn',
            imageUrl: `https://picsum.photos/seed/${tableId}/400/300`
        };
    },

    // ==================== IMAGES ====================
    
    async getImages(type = null) {
        await this.delay();
        let images = MOCK_DATA.restaurantImages.map(i => ({
            id: i.id,
            type: i.type,
            url: i.file_path,
            caption: i.caption,
            isPrimary: i.is_primary
        }));
        
        if (type) {
            images = images.filter(i => i.type === type);
        }
        
        return { data: images };
    },

    async uploadImage(file, type) {
        await this.delay();
        const newId = Math.max(...MOCK_DATA.restaurantImages.map(i => i.id)) + 1;
        return { success: true, message: 'Đã upload ảnh', id: newId };
    },

    async deleteImage(id) {
        await this.delay();
        const index = MOCK_DATA.restaurantImages.findIndex(i => i.id === parseInt(id));
        if (index > -1) MOCK_DATA.restaurantImages.splice(index, 1);
        MOCK_DATA.saveImages();
        return { success: true, message: 'Đã xóa ảnh' };
    },

    async setPrimaryImage(id) {
        await this.delay();
        MOCK_DATA.restaurantImages.forEach(i => i.is_primary = false);
        const image = MOCK_DATA.restaurantImages.find(i => i.id === parseInt(id));
        if (image) image.is_primary = true;
        MOCK_DATA.saveImages();
        return { success: true, message: 'Đã đặt làm ảnh chính' };
    },

    // ==================== REVIEWS ====================
    
    async getReviews(params = {}) {
        await this.delay();
        
        let reviews = MOCK_DATA.reviews.map(r => {
            const user = MOCK_DATA.getUser(r.user_id);
            return {
                id: r.id,
                rating: r.rating,
                content: r.comment,
                customerName: user ? user.display_name : 'Khách',
                customerAvatar: user ? user.avatar_url : null,
                ownerReply: r.owner_reply,
                createdAt: r.created_at,
                isVisible: r.status === 'VISIBLE'
            };
        });
        
        // Filter by rating
        if (params.rating) {
            reviews = reviews.filter(r => r.rating === parseInt(params.rating));
        }
        
        // Filter by visibility
        if (params.status === 'visible') {
            reviews = reviews.filter(r => r.isVisible);
        } else if (params.status === 'hidden') {
            reviews = reviews.filter(r => !r.isVisible);
        }
        
        // Filter by date range
        if (params.from) {
            const fromDate = new Date(params.from);
            reviews = reviews.filter(r => new Date(r.createdAt) >= fromDate);
        }
        if (params.to) {
            const toDate = new Date(params.to);
            // Set end of day
            toDate.setHours(23, 59, 59, 999);
            reviews = reviews.filter(r => new Date(r.createdAt) <= toDate);
        }

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 5; // Less items per page for reviews
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedReviews = reviews.slice(startIndex, endIndex);
        
        return { 
            data: paginatedReviews, 
            total: reviews.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(reviews.length / limit),
                total: reviews.length,
                from: startIndex + 1,
                to: Math.min(endIndex, reviews.length),
                hasNext: endIndex < reviews.length,
                hasPrev: page > 1
            }
        };
    },

    async getReviewById(id) {
        await this.delay();
        const r = MOCK_DATA.reviews.find(r => r.id === parseInt(id));
        if (!r) return null;
        const user = MOCK_DATA.getUser(r.user_id);
        return {
            id: r.id,
            rating: r.rating,
            content: r.comment,
            customerName: user ? user.display_name : 'Khách',
            customerAvatar: user ? user.avatar_url : null,
            ownerReply: r.owner_reply,
            createdAt: r.created_at,
            isVisible: r.status === 'VISIBLE'
        };
    },

    async replyReview(id, reply) {
        await this.delay();
        const review = MOCK_DATA.reviews.find(r => r.id === parseInt(id));
        if (review) review.owner_reply = reply;
        MOCK_DATA.saveReviews();
        return { success: true, message: 'Đã gửi phản hồi' };
    },

    async hideReview(id) {
        await this.delay();
        const review = MOCK_DATA.reviews.find(r => r.id === parseInt(id));
        if (review) review.status = 'HIDDEN';
        MOCK_DATA.saveReviews();
        return { success: true, message: 'Đã ẩn đánh giá' };
    },

    async showReview(id) {
        await this.delay();
        const review = MOCK_DATA.reviews.find(r => r.id === parseInt(id));
        if (review) review.status = 'VISIBLE';
        MOCK_DATA.saveReviews();
        return { success: true, message: 'Đã hiển thị đánh giá' };
    },

    // ==================== NOTIFICATIONS ====================
    
    async getNotifications(params = {}) {
        await this.delay();
        
        let notifications = MOCK_DATA.notifications.map(n => {
            let content = n.message;
            
            // Dynamically generate booking notification message with actual booking time
            if (n.booking_id && (n.type === 'BOOKING_CREATED' || n.type === 'BOOKING_CONFIRMED')) {
                const booking = MOCK_DATA.bookings.find(b => b.id === n.booking_id);
                if (booking) {
                    const user = MOCK_DATA.getUser(booking.user_id);
                    const bookingTime = new Date(booking.booking_time);
                    const timeStr = bookingTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    content = `Khách ${user?.display_name || 'N/A'} đã đặt bàn cho ${booking.people_count} người lúc ${timeStr}`;
                }
            }
            
            return {
                id: n.id,
                type: n.type,
                title: n.title,
                content,
                createdAt: n.created_at,
                isRead: n.is_read,
                bookingId: n.booking_id,
                reviewId: n.review_id,
                accountId: n.account_id
            };
        });
        
        if (params.is_read === 'false') {
            notifications = notifications.filter(n => !n.isRead);
        }
        
        if (params.type) {
            notifications = notifications.filter(n => n.type === params.type);
        }
        
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedNotifications = notifications.slice(startIndex, endIndex);
        
        return { 
            data: paginatedNotifications, 
            total: notifications.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(notifications.length / limit),
                total: notifications.length,
                from: startIndex + 1,
                to: Math.min(endIndex, notifications.length),
                hasNext: endIndex < notifications.length,
                hasPrev: page > 1
            },
            unreadCount: notifications.filter(n => !n.isRead).length
        };
    },

    async getUnreadCount() {
        await this.delay();
        return { count: MOCK_DATA.notifications.filter(n => !n.is_read).length };
    },

    async markAsRead(id) {
        await this.delay();
        const notification = MOCK_DATA.notifications.find(n => n.id === parseInt(id));
        if (notification) {
            notification.is_read = true;
            notification.read_at = new Date().toISOString();
        }
        MOCK_DATA.saveNotifications();
        return { success: true };
    },

    async markAllAsRead() {
        await this.delay();
        MOCK_DATA.notifications.forEach(n => {
            n.is_read = true;
            n.read_at = new Date().toISOString();
        });
        MOCK_DATA.saveNotifications();
        return { success: true };
    },

    // ==================== RESTAURANT ====================
    
    async getRestaurantInfo() {
        await this.delay();
        const r = MOCK_DATA.restaurants[0];
        // Handle tags whether it's string or array
        const tags = Array.isArray(r.tags) ? r.tags : (r.tags ? r.tags.split(',') : []);
        return {
            id: r.id,
            name: r.name,
            address: r.address,
            phone: r.phone,
            description: r.description,
            tags: tags,
            requireDeposit: r.require_deposit,
            defaultDeposit: r.default_deposit_amount,
            averageRating: r.average_rating,
            reviewCount: r.review_count
        };
    },

    async updateRestaurant(data) {
        await this.delay();
        const restaurant = MOCK_DATA.restaurants[0];
        Object.assign(restaurant, {
            name: data.name || restaurant.name,
            address: data.address || restaurant.address,
            phone: data.phone || restaurant.phone,
            description: data.description || restaurant.description,
            tags: data.tags || restaurant.tags,
            require_deposit: data.requireDeposit !== undefined ? data.requireDeposit === 'on' : restaurant.require_deposit,
            default_deposit_amount: data.defaultDeposit ? parseInt(data.defaultDeposit) : restaurant.default_deposit_amount
        });
        // Persist to localStorage
        MOCK_DATA.saveRestaurants();
        return { success: true, message: 'Đã cập nhật thông tin nhà hàng' };
    },

    async updateRestaurantHours(hours) {
        await this.delay();
        // In a real implementation, this would update operating hours in the database
        return { success: true, message: 'Đã cập nhật giờ mở cửa' };
    },

    // ==================== ACCOUNTS ====================
    
    async getPendingAccounts() {
        await this.delay();
        const pending = MOCK_DATA.restaurantAccounts
            .filter(a => a.status === 'PENDING')
            .map(a => ({
                id: a.id,
                name: a.full_name,
                email: a.email,
                role: a.role,
                avatar: a.avatar_url,
                requestedAt: a.created_at
            }));
        return { data: pending };
    },

    async getAccounts(params = {}) {
        await this.delay();
        const accounts = MOCK_DATA.restaurantAccounts
            .filter(a => a.status !== 'PENDING')
            .map(a => ({
                id: a.id,
                name: a.full_name,
                email: a.email,
                role: a.role,
                status: a.status,
                avatar: a.avatar_url,
                createdAt: a.created_at
            }));

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedAccounts = accounts.slice(startIndex, endIndex);
        
        return { 
            data: paginatedAccounts, 
            total: accounts.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(accounts.length / limit),
                total: accounts.length,
                from: startIndex + 1,
                to: Math.min(endIndex, accounts.length),
                hasNext: endIndex < accounts.length,
                hasPrev: page > 1
            }
        };
    },

    async getAccountById(id) {
        await this.delay();
        const a = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (!a) return null;
        return {
            id: a.id,
            name: a.full_name,
            email: a.email,
            phone: a.phone || null,
            role: a.role,
            status: a.status,
            avatar: a.avatar_url,
            createdAt: a.created_at
        };
    },

    async approveAccount(id) {
        await this.delay();
        const account = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (account) account.status = 'ACTIVE';
        MOCK_DATA.saveAccounts();
        return { success: true, message: 'Đã duyệt tài khoản' };
    },

    async rejectAccount(id) {
        await this.delay();
        const account = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (account) account.status = 'REJECTED';
        MOCK_DATA.saveAccounts();
        return { success: true, message: 'Đã từ chối tài khoản' };
    },

    async updateAccountStatus(id, status) {
        await this.delay();
        const account = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (account) account.status = status;
        MOCK_DATA.saveAccounts();
        return { success: true, message: 'Đã cập nhật trạng thái' };
    },

    async updateAccountRole(id, role) {
        await this.delay();
        const account = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (account) account.role = role;
        MOCK_DATA.saveAccounts();
        return { success: true, message: 'Đã cập nhật vai trò' };
    },

    // ==================== PROFILE ====================
    
    async getProfile() {
        await this.delay();
        const account = getCurrentUser() || MOCK_DATA.restaurantAccounts[0];
        const restaurant = MOCK_DATA.restaurants[0];
        return {
            id: account.id,
            name: account.full_name,
            email: account.email,
            role: account.role,
            avatar: account.avatar_url,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name
        };
    },

    async updateProfile(data) {
        await this.delay();
        const account = getCurrentUser() || MOCK_DATA.restaurantAccounts[0];
        if (data.name) account.full_name = data.name;
        // Persist to localStorage
        MOCK_DATA.saveAccounts();
        return { 
            success: true, 
            message: 'Đã cập nhật thông tin',
            data: {
                name: account.full_name,
                email: account.email,
                avatar: account.avatar_url
            }
        };
    },

    async uploadAvatar(file) {
        await this.delay();
        return { success: true, avatarUrl: 'https://i.pravatar.cc/150?img=99' };
    },

    async changePassword(currentPassword, newPassword) {
        await this.delay();
        return { success: true, message: 'Đã đổi mật khẩu' };
    }
};
