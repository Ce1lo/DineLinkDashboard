/**
 * Mock Data - Dữ liệu giả lập theo cấu trúc schema.sql
 * 
 * TEST ACCOUNTS:
 * - admin@restaurant.com / 123456 (OWNER)
 * - staff@restaurant.com / 123456 (STAFF)
 * 
 * NOTE: Dữ liệu được lưu vào localStorage để persist qua các lần reload
 */

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
    RESTAURANTS: 'mock_restaurants',
    ACCOUNTS: 'mock_restaurant_accounts',
    TABLES: 'mock_restaurant_tables',
    BOOKINGS: 'mock_bookings',
    REVIEWS: 'mock_reviews',
    NOTIFICATIONS: 'mock_notifications',
    IMAGES: 'mock_restaurant_images'
};

// ==================== HELPER: Load from localStorage or use default ====================
function loadFromStorage(key, defaultData) {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn(`Failed to load ${key} from localStorage:`, e);
    }
    return defaultData;
}

// ==================== HELPER: Save to localStorage ====================
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e);
    }
}

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
        favorite_count: 45,
        main_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
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
    },
    {
        id: 7,
        restaurant_id: 1,
        full_name: 'Nguyễn Thị Thu',
        email: 'thu@email.com',
        role: 'STAFF',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=30',
        created_at: '2024-05-01T00:00:00Z',
        updated_at: '2024-05-01T00:00:00Z'
    },
    {
        id: 8,
        restaurant_id: 1,
        full_name: 'Trần Văn Hùng',
        email: 'hung@email.com',
        role: 'STAFF',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=31',
        created_at: '2024-05-02T00:00:00Z',
        updated_at: '2024-05-02T00:00:00Z'
    },
    {
        id: 9,
        restaurant_id: 1,
        full_name: 'Phạm Thị Lan',
        email: 'lan@email.com',
        role: 'STAFF',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=32',
        created_at: '2024-05-03T00:00:00Z',
        updated_at: '2024-05-03T00:00:00Z'
    },
    {
        id: 10,
        restaurant_id: 1,
        full_name: 'Hoàng Văn Minh',
        email: 'minh@email.com',
        role: 'STAFF',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=33',
        created_at: '2024-05-04T00:00:00Z',
        updated_at: '2024-05-04T00:00:00Z'
    },
    {
        id: 11,
        restaurant_id: 1,
        full_name: 'Vũ Thị Ngọc',
        email: 'ngoc@email.com',
        role: 'STAFF',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=34',
        created_at: '2024-05-05T00:00:00Z',
        updated_at: '2024-05-05T00:00:00Z'
    },
    {
        id: 12,
        restaurant_id: 1,
        full_name: 'Đặng Văn Kiên',
        email: 'kien@email.com',
        role: 'STAFF',
        status: 'ACTIVE',
        avatar_url: 'https://i.pravatar.cc/150?img=35',
        created_at: '2024-05-06T00:00:00Z',
        updated_at: '2024-05-06T00:00:00Z'
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

// ==================== BOOKINGS (Dynamic dates based on current time) ====================
// Helper function to create dates relative to now
function getRelativeDate(hoursFromNow, minuteOffset = 0) {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    date.setMinutes(minuteOffset);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.toISOString();
}

function getRelativeDateByDays(daysFromNow, hour, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

const _bookings = [
    {
        id: 1,
        restaurant_id: 1,
        table_id: 5,
        user_id: 1,
        people_count: 4,
        booking_time: getRelativeDate(1, 30), // 1 giờ 30 phút nữa
        status: 'CONFIRMED',
        deposit_amount: 200000,
        payment_status: 'PAID',
        note: '',
        created_at: getRelativeDate(-24),
        updated_at: getRelativeDate(-22)
    },
    {
        id: 2,
        restaurant_id: 1,
        table_id: 2,
        user_id: 2,
        people_count: 2,
        booking_time: getRelativeDate(2, 0), // 2 giờ nữa
        status: 'PENDING',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: 'Kỷ niệm ngày cưới',
        created_at: getRelativeDate(-48),
        updated_at: getRelativeDate(-48)
    },
    {
        id: 3,
        restaurant_id: 1,
        table_id: 8,
        user_id: 3,
        people_count: 6,
        booking_time: getRelativeDate(3, 30), // 3 giờ 30 phút nữa
        status: 'CONFIRMED',
        deposit_amount: 500000,
        payment_status: 'PAID',
        note: '',
        created_at: getRelativeDate(-72),
        updated_at: getRelativeDate(-70)
    },
    {
        id: 4,
        restaurant_id: 1,
        table_id: null,
        user_id: 4,
        people_count: 3,
        booking_time: getRelativeDate(4, 0), // 4 giờ nữa
        status: 'PENDING',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: 'Cần ghế trẻ em',
        created_at: getRelativeDate(-24),
        updated_at: getRelativeDate(-24)
    },
    {
        id: 5,
        restaurant_id: 1,
        table_id: 10,
        user_id: 5,
        people_count: 8,
        booking_time: getRelativeDateByDays(0, 19, 0), // Hôm nay 19:00
        status: 'CONFIRMED',
        deposit_amount: 1000000,
        payment_status: 'PAID',
        note: 'Tiệc sinh nhật, cần trang trí',
        created_at: getRelativeDate(-96),
        updated_at: getRelativeDate(-94)
    },
    {
        id: 6,
        restaurant_id: 1,
        table_id: 3,
        user_id: 1,
        people_count: 4,
        booking_time: getRelativeDate(-2), // 2 giờ trước
        status: 'CHECKED_IN',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: '',
        created_at: getRelativeDate(-26),
        updated_at: getRelativeDate(-2)
    },
    {
        id: 7,
        restaurant_id: 1,
        table_id: 1,
        user_id: 2,
        people_count: 2,
        booking_time: getRelativeDateByDays(-1, 12, 0), // Hôm qua 12:00
        status: 'CANCELLED',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: 'Khách có việc bận',
        created_at: getRelativeDate(-72),
        updated_at: getRelativeDate(-48)
    },
    {
        id: 8,
        restaurant_id: 1,
        table_id: 6,
        user_id: 3,
        people_count: 5,
        booking_time: getRelativeDateByDays(-2, 18, 30), // 2 ngày trước 18:30
        status: 'NO_SHOW',
        deposit_amount: 300000,
        payment_status: 'PAID',
        note: '',
        created_at: getRelativeDate(-120),
        updated_at: getRelativeDate(-48)
    },
    {
        id: 9,
        restaurant_id: 1,
        table_id: 7,
        user_id: 4,
        people_count: 5,
        booking_time: getRelativeDateByDays(1, 12, 30), // Ngày mai 12:30
        status: 'PENDING',
        deposit_amount: 0,
        payment_status: 'NONE',
        note: 'Họp mặt bạn bè',
        created_at: getRelativeDate(-6),
        updated_at: getRelativeDate(-6)
    },
    {
        id: 10,
        restaurant_id: 1,
        table_id: 9,
        user_id: 5,
        people_count: 6,
        booking_time: getRelativeDateByDays(1, 18, 0), // Ngày mai 18:00
        status: 'CONFIRMED',
        deposit_amount: 300000,
        payment_status: 'PAID',
        note: 'Tiệc chia tay đồng nghiệp',
        created_at: getRelativeDate(-12),
        updated_at: getRelativeDate(-10)
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
    },
    {
        id: 6,
        booking_id: 9,
        restaurant_id: 1,
        user_id: 2,
        rating: 5,
        comment: 'Tuyệt vời!',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-11-19T10:00:00Z',
        updated_at: '2024-11-19T10:00:00Z'
    },
    {
        id: 7,
        booking_id: 10,
        restaurant_id: 1,
        user_id: 3,
        rating: 4,
        comment: 'Good service',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-11-18T10:00:00Z',
        updated_at: '2024-11-18T10:00:00Z'
    },
    {
        id: 8,
        booking_id: null,
        restaurant_id: 1,
        user_id: 4,
        rating: 3,
        comment: 'Average',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-11-17T10:00:00Z',
        updated_at: '2024-11-17T10:00:00Z'
    },
    {
        id: 9,
        booking_id: null,
        restaurant_id: 1,
        user_id: 5,
        rating: 5,
        comment: 'Excellent!',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-11-16T10:00:00Z',
        updated_at: '2024-11-16T10:00:00Z'
    },
    {
        id: 10,
        booking_id: null,
        restaurant_id: 1,
        user_id: 1,
        rating: 4,
        comment: 'Nice place',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-11-15T10:00:00Z',
        updated_at: '2024-11-15T10:00:00Z'
    },
    {
        id: 11,
        booking_id: null,
        restaurant_id: 1,
        user_id: 2,
        rating: 5,
        comment: 'Love it',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-11-14T10:00:00Z',
        updated_at: '2024-11-14T10:00:00Z'
    },
    {
        id: 12,
        booking_id: null,
        restaurant_id: 1,
        user_id: 3,
        rating: 3,
        comment: 'Okay',
        status: 'VISIBLE',
        owner_reply: null,
        created_at: '2024-11-13T10:00:00Z',
        updated_at: '2024-11-13T10:00:00Z'
    }
];

// ==================== NOTIFICATIONS ====================
const _notifications = [
    // ============ BOOKING TAB (8 types) ============
    
    // 1. BOOKING_CREATED (Yellow - New)
    {
        id: 1,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CREATED',
        title: 'Đặt bàn mới',
        message: 'Khách Trần Văn Bình đã đặt bàn cho 2 người lúc 19:00 hôm nay',
        booking_id: 1,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: getRelativeDate(1),
        sent_at: getRelativeDate(1)
    },
    {
        id: 2,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CREATED',
        title: 'Đặt bàn cuối tuần',
        message: 'Khách Lê Thị Cẩm đã đặt bàn cho 6 người vào Chủ nhật 18:30',
        booking_id: 2,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: getRelativeDate(2),
        sent_at: getRelativeDate(2)
    },

    // 2. BOOKING_UPDATED (Blue - Info)
    {
        id: 3,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_UPDATED',
        title: 'Khách thay đổi booking',
        message: 'Booking #BK003 đã đổi từ 4 người → 6 người',
        booking_id: 3,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-14T15:00:00Z',
        sent_at: '2024-12-14T15:00:00Z'
    },

    // 3. BOOKING_CONFIRMED (Green - Success)
    {
        id: 4,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CONFIRMED',
        title: 'Xác nhận booking',
        message: 'Booking #BK005 của khách Hoàng Văn Phú đã được xác nhận',
        booking_id: 5,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: true,
        read_at: '2024-12-05T19:00:00Z',
        created_at: '2024-12-05T18:00:00Z',
        sent_at: '2024-12-05T18:00:00Z'
    },

    // 4. BOOKING_CANCELLED (Red - Danger)
    {
        id: 5,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CANCELLED',
        title: 'Khách hủy đặt bàn',
        message: 'Booking #BK007 (4 người) đã bị khách hủy do bận việc đột xuất',
        booking_id: 7,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-13T11:00:00Z',
        sent_at: '2024-12-13T11:00:00Z'
    },
    {
        id: 6,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CANCELLED',
        title: 'Nhà hàng hủy booking',
        message: 'Booking #BK008 đã bị hủy do nhà hàng quá tải',
        booking_id: 8,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: true,
        read_at: '2024-12-12T10:00:00Z',
        created_at: '2024-12-12T09:30:00Z',
        sent_at: '2024-12-12T09:30:00Z'
    },

    // 5. BOOKING_CHECKED_IN (Green - Success)
    {
        id: 7,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_CHECKED_IN',
        title: 'Khách đã check-in',
        message: 'Khách Trần Văn Bình (BK006) đã check-in tại Bàn 3',
        booking_id: 6,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: true,
        read_at: '2024-12-14T18:00:00Z',
        created_at: '2024-12-14T18:00:00Z',
        sent_at: '2024-12-14T18:00:00Z'
    },

    // 6. BOOKING_NO_SHOW (Red - Danger)
    {
        id: 8,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_NO_SHOW',
        title: 'Khách vắng mặt',
        message: 'Booking #BK012 đã quá giờ hẹn 15 phút, khách vẫn chưa check-in',
        booking_id: 12,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-13T19:30:00Z',
        sent_at: '2024-12-13T19:30:00Z'
    },

    // 7. BOOKING_PAYMENT_SUCCESS (Green - Success)
    {
        id: 9,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_PAYMENT_SUCCESS',
        title: 'Thanh toán cọc thành công',
        message: 'Đã nhận 500,000đ tiền cọc từ khách Nguyễn Văn A (Booking #BK009)',
        booking_id: 9,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-14T20:00:00Z',
        sent_at: '2024-12-14T20:00:00Z'
    },

    // 8. BOOKING_REFUND_SUCCESS (Green - Success)
    {
        id: 10,
        user_id: null,
        restaurant_id: 1,
        type: 'BOOKING_REFUND_SUCCESS',
        title: 'Hoàn tiền cọc thành công',
        message: 'Đã hoàn 200,000đ cho khách Trần Thị B (Booking #BK010 - Nhà hàng hủy)',
        booking_id: 10,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: true,
        read_at: '2024-12-13T10:00:00Z',
        created_at: '2024-12-13T10:00:00Z',
        sent_at: '2024-12-13T10:00:00Z'
    },

    // ============ REVIEW TAB (1 type) ============
    
    // 9. REVIEW_CREATED (Yellow - New)
    {
        id: 11,
        user_id: null,
        restaurant_id: 1,
        type: 'REVIEW_CREATED',
        title: 'Đánh giá 5 sao',
        message: 'Khách Trần Văn Bình đã đánh giá 5 sao: "Rất hài lòng với chất lượng phục vụ!"',
        booking_id: null,
        review_id: 1,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-14T22:00:00Z',
        sent_at: '2024-12-14T22:00:00Z'
    },
    {
        id: 12,
        user_id: null,
        restaurant_id: 1,
        type: 'REVIEW_CREATED',
        title: 'Đánh giá 1 sao!',
        message: 'Khách ẩn danh vừa để lại đánh giá 1 sao: "Phục vụ quá tệ!"',
        booking_id: null,
        review_id: 3,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-14T21:30:00Z',
        sent_at: '2024-12-14T21:30:00Z'
    },
    {
        id: 13,
        user_id: null,
        restaurant_id: 1,
        type: 'REVIEW_CREATED',
        title: 'Đánh giá 3 sao',
        message: 'Khách Phạm Văn Đức đã đánh giá 3 sao: "Bình thường, không có gì đặc biệt"',
        booking_id: null,
        review_id: 4,
        account_id: null,
        channel: 'IN_APP',
        is_read: true,
        read_at: '2024-12-13T08:00:00Z',
        created_at: '2024-12-13T07:45:00Z',
        sent_at: '2024-12-13T07:45:00Z'
    },

    // ============ STAFF TAB (2 types) ============
    
    // 10. STAFF_REGISTERED (Yellow - New)
    {
        id: 14,
        user_id: null,
        restaurant_id: 1,
        type: 'STAFF_REGISTERED',
        title: 'Đăng ký nhân viên mới',
        message: 'Nhân viên "Lê Văn Tuấn" vừa đăng ký tài khoản và chờ duyệt.',
        booking_id: null,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-14T09:00:00Z',
        sent_at: '2024-12-14T09:00:00Z'
    },

    // 11. STAFF_STATUS_CHANGED (Blue - Info)
    {
        id: 15,
        user_id: null,
        restaurant_id: 1,
        type: 'STAFF_STATUS_CHANGED',
        title: 'Duyệt nhân viên',
        message: 'Tài khoản của bạn đã được duyệt và chuyển sang trạng thái ACTIVE.',
        booking_id: null,
        review_id: null,
        account_id: 3, // Staff specific notification
        channel: 'IN_APP',
        is_read: true,
        read_at: '2024-12-12T08:00:00Z',
        created_at: '2024-12-12T08:00:00Z',
        sent_at: '2024-12-12T08:00:00Z'
    },
    {
        id: 16,
        user_id: null,
        restaurant_id: 1,
        type: 'STAFF_STATUS_CHANGED',
        title: 'Khóa tài khoản nhân viên',
        message: 'Nhân viên "Vũ Văn Staff2" đã bị khóa tài khoản do vi phạm nội quy.',
        booking_id: null,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-11-01T10:00:00Z',
        sent_at: '2024-11-01T10:00:00Z'
    },

    // ============ SYSTEM TAB (3 types) ============
    
    // 12. CHANGED_PASSWORD (Blue - Info)
    {
        id: 17,
        user_id: null,
        restaurant_id: 1,
        type: 'CHANGED_PASSWORD',
        title: 'Đổi mật khẩu thành công',
        message: 'Bạn đã thay đổi mật khẩu thành công lúc 14:30 ngày 14/12/2024.',
        booking_id: null,
        review_id: null,
        account_id: 1, // Owner account
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-14T14:30:00Z',
        sent_at: '2024-12-14T14:30:00Z'
    },

    // 13. UPDATED_INFO_SUCCESS (Blue - Info)
    {
        id: 18,
        user_id: null,
        restaurant_id: 1,
        type: 'UPDATED_INFO_SUCCESS',
        title: 'Cập nhật thông tin thành công',
        message: 'Thông tin nhà hàng (địa chỉ, số điện thoại) đã được cập nhật thành công.',
        booking_id: null,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-14T16:00:00Z',
        sent_at: '2024-12-14T16:00:00Z'
    },

    // 14. GENERIC (Blue - Info)
    {
        id: 19,
        user_id: null,
        restaurant_id: 1,
        type: 'GENERIC',
        title: 'Bảo trì hệ thống',
        message: 'Hệ thống sẽ bảo trì từ 02:00 đến 04:00 sáng ngày mai. Vui lòng lưu ý.',
        booking_id: null,
        review_id: null,
        account_id: null,
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-14T18:00:00Z',
        sent_at: '2024-12-14T18:00:00Z'
    },

    // Additional Staff notification (for test account)
    {
        id: 20,
        user_id: null,
        restaurant_id: 1,
        type: 'STAFF_STATUS_CHANGED',
        title: 'Thông báo cá nhân',
        message: 'Tài khoản của bạn đã được kích hoạt. Chào mừng đến với đội ngũ!',
        booking_id: null,
        review_id: null,
        account_id: 3, // For staff@restaurant.com
        channel: 'IN_APP',
        is_read: false,
        read_at: null,
        created_at: '2024-12-03T08:00:00Z',
        sent_at: '2024-12-03T08:00:00Z'
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
// Load data from localStorage or use defaults
export const MOCK_DATA = {
    users: _users,
    restaurants: loadFromStorage(STORAGE_KEYS.RESTAURANTS, _restaurants),
    restaurantAccounts: loadFromStorage(STORAGE_KEYS.ACCOUNTS, _restaurantAccounts),
    restaurantTables: loadFromStorage(STORAGE_KEYS.TABLES, _restaurantTables),
    bookings: loadFromStorage(STORAGE_KEYS.BOOKINGS, _bookings),
    reviews: loadFromStorage(STORAGE_KEYS.REVIEWS, _reviews),
    notifications: loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, _notifications),
    restaurantImages: loadFromStorage(STORAGE_KEYS.IMAGES, _restaurantImages),

    // Helper: Get user by ID
    getUser(id) {
        return _users.find(u => u.id === id);
    },

    // Helper: Get table by ID  
    getTable(id) {
        return this.restaurantTables.find(t => t.id === id);
    },

    // Helper: Get account by email
    getAccountByEmail(email) {
        return this.restaurantAccounts.find(a => a.email === email);
    },

    // Save current data to localStorage
    saveRestaurants() {
        saveToStorage(STORAGE_KEYS.RESTAURANTS, this.restaurants);
    },

    saveAccounts() {
        saveToStorage(STORAGE_KEYS.ACCOUNTS, this.restaurantAccounts);
    },

    saveTables() {
        saveToStorage(STORAGE_KEYS.TABLES, this.restaurantTables);
    },

    saveBookings() {
        saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    },

    saveReviews() {
        saveToStorage(STORAGE_KEYS.REVIEWS, this.reviews);
    },

    saveNotifications() {
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    },

    saveImages() {
        saveToStorage(STORAGE_KEYS.IMAGES, this.restaurantImages);
    },

    // Reset all data to defaults (clear localStorage)
    resetAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('🔄 Mock data reset to defaults. Please reload the page.');
    }
};

// Log mock mode
console.log('🎭 Mock Mode: Dữ liệu được lưu vào localStorage');
console.log('📧 Account test: admin@restaurant.com / 123456');
console.log('🔄 Để reset dữ liệu: MOCK_DATA.resetAll() trong console');
