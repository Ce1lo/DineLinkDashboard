/**
 * Cấu hình ứng dụng
 */
export const CONFIG = {
  // URL gốc của Backend API
  API_BASE_URL: "http://localhost:8207",

  // Tiền tố API cho các endpoint dashboard
  API_PREFIX: "/api/v1/dashboard",

  // Tự động chuyển sang mock data khi API lỗi
  USE_MOCK: true,

  // Các khóa lưu trữ trong LocalStorage
  STORAGE_KEYS: {
    TOKEN: "auth_token",
    USER: "user_info",
    REMEMBER_ME: "remember_me",
  },

  // Cấu hình đường dẫn (routes)
  ROUTES: {
    LOGIN: "/login",
    REGISTER_OWNER: "/register-owner",
    REGISTER_STAFF: "/register-staff",
    DASHBOARD: "/dashboard",
    BOOKINGS: "/bookings",
    TABLES: "/tables",
    IMAGES: "/images",
    REVIEWS: "/reviews",
    NOTIFICATIONS: "/notifications",
    RESTAURANT: "/restaurant",
    ACCOUNTS: "/accounts",
    PROFILE: "/profile",
  },

  // Các route công khai (không cần đăng nhập)
  PUBLIC_ROUTES: ["/login", "/register-owner", "/register-staff", "/"],

  // Trạng thái đặt bàn
  BOOKING_STATUS: {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    CHECKED_IN: "CHECKED_IN",
    NO_SHOW: "NO_SHOW",
  },

  // Loại thông báo
  NOTIFICATION_TYPES: {
    BOOKING_CREATED: "BOOKING_CREATED",
    BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
    BOOKING_CANCELLED: "BOOKING_CANCELLED",
    REVIEW_CREATED: "REVIEW_CREATED",
  },

  // Loại hình ảnh
  IMAGE_TYPES: {
    COVER: "COVER",
    GALLERY: "GALLERY",
    MENU: "MENU",
  },

  // Trạng thái tài khoản
  ACCOUNT_STATUS: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    PENDING: "PENDING",
    REJECTED: "REJECTED",
  },

  // Trạng thái bàn
  TABLE_STATUS: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
  },
};

// Đóng băng config để ngăn chỉnh sửa
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.ROUTES);
Object.freeze(CONFIG.BOOKING_STATUS);
Object.freeze(CONFIG.NOTIFICATION_TYPES);
Object.freeze(CONFIG.IMAGE_TYPES);
Object.freeze(CONFIG.ACCOUNT_STATUS);
Object.freeze(CONFIG.TABLE_STATUS);
