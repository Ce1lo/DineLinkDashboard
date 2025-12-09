/**
 * Mock Data - Dữ liệu giả lập theo cấu trúc schema.sql
 * 
 * TEST ACCOUNTS:
 * - admin@restaurant.com / 123456 (OWNER)
 * - staff@restaurant.com / 123456 (STAFF)
 */

// ==================== USERS (Khách hàng đặt bàn) ====================
const _users = [
    {
        id: 1,
        display_name: 'Trần Văn Bình',
        email: 'tranvanbinh@gmail.com',
        phone: '0901234567',
        avatar_url: 'https://i.pravatar.cc/150?img=1',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
    },
    {
        id: 2,
        display_name: 'Lê Thị Cẩm',
        email: 'lethicam@gmail.com',
        phone: '0912345678',
        avatar_url: 'https://i.pravatar.cc/150?img=5',
        created_at: '2024-02-20T10:30:00Z',
        updated_at: '2024-02-20T10:30:00Z'
    },
    {
        id: 3,
        display_name: 'Phạm Văn Đức',
        email: 'phamvanduc@gmail.com',
        phone: '0923456789',
        avatar_url: 'https://i.pravatar.cc/150?img=3',
        created_at: '2024-03-10T14:00:00Z',
        updated_at: '2024-03-10T14:00:00Z'
    },
    {
        id: 4,
        display_name: 'Nguyễn Thị Em',
        email: 'nguyenthiem@gmail.com',
        phone: '0934567890',
        avatar_url: 'https://i.pravatar.cc/150?img=10',
        created_at: '2024-04-05T09:00:00Z',
        updated_at: '2024-04-05T09:00:00Z'
    },
    {
        id: 5,
        display_name: 'Hoàng Văn Phú',
        email: 'hoangvanphu@gmail.com',
        phone: '0945678901',
        avatar_url: 'https://i.pravatar.cc/150?img=7',
        created_at: '2024-05-12T11:00:00Z',
        updated_at: '2024-05-12T11:00:00Z'
    }
];

// ==================== RESTAURANTS ====================
const _restaurants = [
    {
        id: 1,
        name: 'Nhà hàng Phố Cổ',
        address: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
        phone: '024 1234 5678',
        description: 'Nhà hàng ẩm thực Việt Nam truyền thống với không gian cổ kính, ấm cúng. Chuyên phục vụ các món ăn đặc sản miền Bắc.',
        tags: 'vietnamese,traditional,family',
        require_deposit: true,
        default_deposit_amount: 200000,
        is_active: true,
        average_rating: 4.5,
        review_count: 128,
        invite_code: 'PHOCO2024',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z'
    }
];

// ==================== RESTAURANT ACCOUNTS (Staff/Owner) ====================
const _restaurantAccounts = [
    {
        id: 1,
        restaurant_id: 1,
        full_name: 'Nguyễn Văn An',
        email: 'admin@restaurant.com',
        password: '123456',
        role: 'OWNER',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=12',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 2,
        restaurant_id: 1,
        full_name: 'Phạm Thị Manager',
        email: 'manager@restaurant.com',
        password: '123456',
        role: 'MANAGER',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=25',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
    },
    {
        id: 3,
        restaurant_id: 1,
        full_name: 'Hoàng Thị Staff',
        email: 'staff@restaurant.com',
        password: '123456',
        role: 'STAFF',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=15',
        created_at: '2024-03-01T00:00:00Z',
        updated_at: '2024-03-01T00:00:00Z'
    },
    {
        id: 4,
        restaurant_id: 1,
        full_name: 'Vũ Văn Staff2',
        email: 'staff2@restaurant.com',
        password: '123456',
        role: 'STAFF',
        status: 'INACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=18',
        created_at: '2024-04-01T00:00:00Z',
        updated_at: '2024-11-01T00:00:00Z'
    },
    {
        id: 5,
        restaurant_id: 1,
        full_name: 'Trần Văn Nhân',
        email: 'nhan@email.com',
        password: '123456',
        role: 'STAFF',
        status: 'PENDING',
        avatar_url: 'https://i.pravatar.cc/150?img=20',
        created_at: '2024-12-03T00:00:00Z',
        updated_at: '2024-12-03T00:00:00Z'
    },
    {
        id: 6,
        restaurant_id: 1,
        full_name: 'Lê Thị Hoa',
        email: 'hoa@email.com',
        password: '123456',
        role: 'STAFF',
        status: 'PENDING',
        avatar_url: 'https://i.pravatar.cc/150?img=22',
        created_at: '2024-12-02T00:00:00Z',
        updated_at: '2024-12-02T00:00:00Z'
    }
];

// ==================== RESTAURANT TABLES ====================
const _restaurantTables = [
    { id: 1, restaurant_id: 1, name: 'Bàn 1', capacity: 2, location: 'Tầng 1', status: 'ACTIVE', view_image_url: null, view_note: 'Cạnh cửa sổ' },
    { id: 2, restaurant_id: 1, name: 'Bàn 2', capacity: 2, location: 'Tầng 1', status: 'ACTIVE', view_image_url: null, view_note: null },
    { id: 3, restaurant_id: 1, name: 'Bàn 3', capacity: 4, location: 'Tầng 1', status: 'ACTIVE', view_image_url: null, view_note: null },
    { id: 4, restaurant_id: 1, name: 'Bàn 4', capacity: 4, location: 'Tầng 1', status: 'INACTIVE', view_image_url: null, view_note: 'Đang bảo trì' },
    { id: 5, restaurant_id: 1, name: 'Bàn 5', capacity: 4, location: 'Tầng 2', status: 'ACTIVE', view_image_url: null, view_note: null },
    { id: 6, restaurant_id: 1, name: 'Bàn 6', capacity: 6, location: 'Tầng 2', status: 'ACTIVE', view_image_url: null, view_note: null },
    { id: 7, restaurant_id: 1, name: 'Bàn 7', capacity: 6, location: 'Tầng 2', status: 'ACTIVE', view_image_url: null, view_note: null },
    { id: 8, restaurant_id: 1, name: 'Bàn 8', capacity: 8, location: 'Sân vườn', status: 'ACTIVE', view_image_url: null, view_note: 'View đẹp' },
    { id: 9, restaurant_id: 1, name: 'Bàn 9', capacity: 8, location: 'Sân vườn', status: 'ACTIVE', view_image_url: null, view_note: null },
    { id: 10, restaurant_id: 1, name: 'Bàn VIP 1', capacity: 12, location: 'Phòng VIP', status: 'ACTIVE', view_image_url: null, view_note: 'Phòng riêng, có karaoke' }
];

// ==================== BOOKINGS ====================
const _bookings = [
    {
        id: 1,
        restaurant_id: 1,
        table_id: 5,
        user_id: 1,
        people_count: 4,
        booking_time: '2024-12-08T11:30:00Z',
        status: 'CONFIRMED',
        deposit_amount: 200000,
        payment_status: 'PAID',
        note: '',
        created_at: '2024-12-07T10:00:00Z',
        updated_at: '2024-12-07T12:00:00Z'
    },
    {
        id: 2,
        restaurant_id: 1,
        table_id: 2,
        user_id: 2,
        people_count: 2,
        booking_time: '2024-12-08T12:00:00Z',
        status: 'PENDING',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: 'Kỷ niệm ngày cưới',
        created_at: '2024-12-07T08:00:00Z',
        updated_at: '2024-12-07T08:00:00Z'
    },
    {
        id: 3,
        restaurant_id: 1,
        table_id: 8,
        user_id: 3,
        people_count: 6,
        booking_time: '2024-12-08T12:30:00Z',
        status: 'CONFIRMED',
        deposit_amount: 500000,
        payment_status: 'PAID',
        note: '',
        created_at: '2024-12-06T14:00:00Z',
        updated_at: '2024-12-06T16:00:00Z'
    },
    {
        id: 4,
        restaurant_id: 1,
        table_id: null,
        user_id: 4,
        people_count: 3,
        booking_time: '2024-12-08T13:00:00Z',
        status: 'PENDING',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: 'Cần ghế trẻ em',
        created_at: '2024-12-07T09:00:00Z',
        updated_at: '2024-12-07T09:00:00Z'
    },
    {
        id: 5,
        restaurant_id: 1,
        table_id: 10,
        user_id: 5,
        people_count: 8,
        booking_time: '2024-12-08T18:00:00Z',
        status: 'CONFIRMED',
        deposit_amount: 1000000,
        payment_status: 'PAID',
        note: 'Tiệc sinh nhật, cần trang trí',
        created_at: '2024-12-05T10:00:00Z',
        updated_at: '2024-12-05T14:00:00Z'
    },
    {
        id: 6,
        restaurant_id: 1,
        table_id: 3,
        user_id: 1,
        people_count: 4,
        booking_time: '2024-12-07T19:00:00Z',
        status: 'CHECKED_IN',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: '',
        created_at: '2024-12-06T15:00:00Z',
        updated_at: '2024-12-07T19:05:00Z'
    },
    {
        id: 7,
        restaurant_id: 1,
        table_id: 1,
        user_id: 2,
        people_count: 2,
        booking_time: '2024-12-07T12:00:00Z',
        status: 'CANCELLED',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: 'Khách có việc bận',
        created_at: '2024-12-05T08:00:00Z',
        updated_at: '2024-12-06T10:00:00Z'
    },
    {
        id: 8,
        restaurant_id: 1,
        table_id: 6,
        user_id: 3,
        people_count: 5,
        booking_time: '2024-12-06T18:30:00Z',
        status: 'NO_SHOW',
        deposit_amount: 300000,
        payment_status: 'PAID',
        note: '',
        created_at: '2024-12-04T09:00:00Z',
        updated_at: '2024-12-06T19:30:00Z'
    }
];

// ==================== REVIEWS ====================
const _reviews = [
    {
        id: 1,
        booking_id: 6,
        restaurant_id: 1,
        user_id: 1,
        rating: 5,
        comment: 'Đồ ăn rất ngon, phục vụ tuyệt vời! Không gian ấm cúng, sẽ quay lại.',
        status: 'VISIBLE',
        owner_reply: 'Cảm ơn quý khách đã tin tưởng. Hẹn gặp lại!',
        created_at: '2024-12-07T21:00:00Z',
        updated_at: '2024-12-08T09:00:00Z'
    },
    {
        id: 2,
        booking_id: 8,
        restaurant_id: 1,
        user_id: 3,
        rating: 4,
        comment: 'Không gian đẹp, giá cả hợp lý. Chờ món hơi lâu.',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-12-06T20:00:00Z',
        updated_at: '2024-12-06T20:00:00Z'
    },
    {
        id: 3,
        booking_id: null,
        restaurant_id: 1,
        user_id: 4,
        rating: 3,
        comment: 'Đồ ăn bình thường, phục vụ được.',
        status: 'VISIBLE',
        owner_reply: 'Cảm ơn góp ý của quý khách, chúng tôi sẽ cải thiện.',
        created_at: '2024-11-28T15:00:00Z',
        updated_at: '2024-11-29T10:00:00Z'
    },
    {
        id: 4,
        booking_id: null,
        restaurant_id: 1,
        user_id: 5,
        rating: 5,
        comment: 'Tuyệt vời! Món phở rất ngon, đậm đà.',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-11-25T12:00:00Z',
        updated_at: '2024-11-25T12:00:00Z'
    },
    {
        id: 5,
        booking_id: null,
        restaurant_id: 1,
        user_id: 2,
        rating: 2,
        comment: 'Phục vụ chậm, đồ ăn nguội.',
        status: 'HIDDEN',
        owner_reply: null,
        created_at: '2024-11-20T19:00:00Z',
        updated_at: '2024-11-21T09:00:00Z'
    }
];

// ==================== NOTIFICATIONS ====================
const _notifications = [
    {
        id: 1,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CREATED',
        title: 'Đặt bàn mới',
        message: 'Khách Trần Văn Bình đã đặt bàn cho 4 người lúc 11:30',
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-07T10:00:00Z',
        sent_at: '2024-12-07T10:00:00Z'
    },
    {
        id: 2,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CREATED',
        title: 'Đặt bàn mới',
        message: 'Khách Lê Thị Cẩm đã đặt bàn cho 2 người lúc 12:00',
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-07T08:00:00Z',
        sent_at: '2024-12-07T08:00:00Z'
    },
    {
        id: 3,
        user_id: null,
        restaurant_id: 1,
        type: 'REVIEW_CREATED',
        title: 'Đánh giá mới',
        message: 'Khách Trần Văn Bình đã đánh giá 5 sao',
        channel: 'IN_APP',
        is_read: true,
        read_at: '2024-12-08T08:00:00Z',
        created_at: '2024-12-07T21:00:00Z',
        sent_at: '2024-12-07T21:00:00Z'
    },
    {
        id: 4,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CANCELLED',
        title: 'Hủy đặt bàn',
        message: 'Khách Lê Thị Cẩm đã hủy đặt bàn ngày 07/12',
        channel: 'IN_APP',
        is_read: true,
        read_at: '2024-12-06T10:30:00Z',
        created_at: '2024-12-06T10:00:00Z',
        sent_at: '2024-12-06T10:00:00Z'
    }
];

// ==================== RESTAURANT IMAGES ====================
const _restaurantImages = [
    { id: 1, restaurant_id: 1, file_path: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', type: 'COVER', caption: 'Không gian nhà hàng', is_primary: true, created_at: '2024-01-01T00:00:00Z' },
    { id: 2, restaurant_id: 1, file_path: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', type: 'GALLERY', caption: 'Món ăn signature', is_primary: false, created_at: '2024-01-02T00:00:00Z' },
    { id: 3, restaurant_id: 1, file_path: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', type: 'GALLERY', caption: 'Khu vực bar', is_primary: false, created_at: '2024-01-03T00:00:00Z' },
    { id: 4, restaurant_id: 1, file_path: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', type: 'GALLERY', caption: 'Góc sân vườn', is_primary: false, created_at: '2024-01-04T00:00:00Z' },
    { id: 5, restaurant_id: 1, file_path: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', type: 'MENU', caption: 'Menu món chính', is_primary: false, created_at: '2024-01-05T00:00:00Z' },
    { id: 6, restaurant_id: 1, file_path: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400', type: 'MENU', caption: 'Menu đồ uống', is_primary: false, created_at: '2024-01-06T00:00:00Z' }
];

// ==================== MOCK DATA EXPORT ====================
export const MOCK_DATA = {
    users: _users,
    restaurants: _restaurants,
    restaurantAccounts: _restaurantAccounts,
    restaurantTables: _restaurantTables,
    bookings: _bookings,
    reviews: _reviews,
    notifications: _notifications,
    restaurantImages: _restaurantImages,

    // Helper: Get user by ID
    getUser(id) {
        return _users.find(u => u.id === id);
    },

    // Helper: Get table by ID  
    getTable(id) {
        return _restaurantTables.find(t => t.id === id);
    },

    // Helper: Get account by email
    getAccountByEmail(email) {
        return _restaurantAccounts.find(a => a.email === email);
    }
};
