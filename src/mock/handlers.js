/**
 * Mock Handlers - Xử lý mock API responses
 * Trả về data theo format mà FE Dashboard cần
 */
import { MOCK_DATA } from './data.js';

// Current logged in user
let _currentUser = null;

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
        _currentUser = account;
        
        console.log('🔐 Mock login success:', account.email);
        
        return {
            token: 'mock_jwt_token_' + account.role.toLowerCase(),
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
        
        // Build upcomingBookings with joined data - lấy tất cả để demo
        const upcomingBookings = allBookings
            .filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED')
            .slice(0, 5)
            .map(b => {
                const user = MOCK_DATA.getUser(b.user_id);
                const table = b.table_id ? MOCK_DATA.getTable(b.table_id) : null;
                const time = new Date(b.booking_time);
                return {
                    id: b.id,
                    time: time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    customerName: user ? user.display_name : 'Khách',
                    guests: b.people_count,
                    table: table ? table.name : null,
                    status: b.status
                };
            });
        
        return {
            kpis: {
                bookingsToday: allBookings.length,
                guestsToday: allBookings.reduce((sum, b) => sum + b.people_count, 0),
                pendingBookings: pendingBookings.length,
                tableOccupancy: Math.round((confirmedBookings.length / MOCK_DATA.restaurantTables.length) * 100)
            },
            upcomingBookings
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
        return { success: true, message: 'Đã xác nhận booking' };
    },

    async cancelBooking(id) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(id));
        if (booking) booking.status = 'CANCELLED';
        return { success: true, message: 'Đã hủy booking' };
    },

    async checkInBooking(id) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(id));
        if (booking) booking.status = 'CHECKED_IN';
        return { success: true, message: 'Đã check-in' };
    },

    async noShowBooking(id) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(id));
        if (booking) booking.status = 'NO_SHOW';
        return { success: true, message: 'Đã đánh dấu no-show' };
    },

    async assignTable(bookingId, tableId) {
        await this.delay();
        const booking = MOCK_DATA.bookings.find(b => b.id === parseInt(bookingId));
        if (booking) booking.table_id = parseInt(tableId);
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
        return { success: true, message: 'Đã tạo bàn mới', id: newId };
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
        return { success: true, message: 'Đã cập nhật bàn' };
    },

    async deleteTable(id) {
        await this.delay();
        const index = MOCK_DATA.restaurantTables.findIndex(t => t.id === parseInt(id));
        if (index > -1) MOCK_DATA.restaurantTables.splice(index, 1);
        return { success: true, message: 'Đã xóa bàn' };
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
        return { success: true, message: 'Đã xóa ảnh' };
    },

    async setPrimaryImage(id) {
        await this.delay();
        MOCK_DATA.restaurantImages.forEach(i => i.is_primary = false);
        const image = MOCK_DATA.restaurantImages.find(i => i.id === parseInt(id));
        if (image) image.is_primary = true;
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
        
        return { data: reviews, total: reviews.length };
    },

    async replyReview(id, reply) {
        await this.delay();
        const review = MOCK_DATA.reviews.find(r => r.id === parseInt(id));
        if (review) review.owner_reply = reply;
        return { success: true, message: 'Đã gửi phản hồi' };
    },

    async hideReview(id) {
        await this.delay();
        const review = MOCK_DATA.reviews.find(r => r.id === parseInt(id));
        if (review) review.status = 'HIDDEN';
        return { success: true, message: 'Đã ẩn đánh giá' };
    },

    async showReview(id) {
        await this.delay();
        const review = MOCK_DATA.reviews.find(r => r.id === parseInt(id));
        if (review) review.status = 'VISIBLE';
        return { success: true, message: 'Đã hiển thị đánh giá' };
    },

    // ==================== NOTIFICATIONS ====================
    
    async getNotifications(params = {}) {
        await this.delay();
        
        let notifications = MOCK_DATA.notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            content: n.message,
            createdAt: n.created_at,
            isRead: n.is_read
        }));
        
        if (params.is_read === 'false') {
            notifications = notifications.filter(n => !n.isRead);
        }
        
        if (params.type) {
            notifications = notifications.filter(n => n.type === params.type);
        }
        
        return { 
            data: notifications, 
            total: notifications.length,
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
        return { success: true };
    },

    async markAllAsRead() {
        await this.delay();
        MOCK_DATA.notifications.forEach(n => {
            n.is_read = true;
            n.read_at = new Date().toISOString();
        });
        return { success: true };
    },

    // ==================== RESTAURANT ====================
    
    async getRestaurantInfo() {
        await this.delay();
        const r = MOCK_DATA.restaurants[0];
        return {
            id: r.id,
            name: r.name,
            address: r.address,
            phone: r.phone,
            description: r.description,
            tags: r.tags.split(','),
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
            description: data.description || restaurant.description
        });
        return { success: true, message: 'Đã cập nhật thông tin nhà hàng' };
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

    async getAccounts() {
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
        return { data: accounts };
    },

    async approveAccount(id) {
        await this.delay();
        const account = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (account) account.status = 'ACTIVE';
        return { success: true, message: 'Đã duyệt tài khoản' };
    },

    async rejectAccount(id) {
        await this.delay();
        const account = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (account) account.status = 'REJECTED';
        return { success: true, message: 'Đã từ chối tài khoản' };
    },

    async updateAccountStatus(id, status) {
        await this.delay();
        const account = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (account) account.status = status;
        return { success: true, message: 'Đã cập nhật trạng thái' };
    },

    async updateAccountRole(id, role) {
        await this.delay();
        const account = MOCK_DATA.restaurantAccounts.find(a => a.id === parseInt(id));
        if (account) account.role = role;
        return { success: true, message: 'Đã cập nhật vai trò' };
    },

    // ==================== PROFILE ====================
    
    async getProfile() {
        await this.delay();
        const account = _currentUser || MOCK_DATA.restaurantAccounts[0];
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
        const account = _currentUser || MOCK_DATA.restaurantAccounts[0];
        if (data.name) account.full_name = data.name;
        return { success: true, message: 'Đã cập nhật thông tin' };
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

// Console log for mock mode
console.log('🎭 Mock Mode: Đang sử dụng dữ liệu giả lập');
console.log('📧 Account test: admin@restaurant.com / 123456');
