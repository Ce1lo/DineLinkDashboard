/**
 * Cấu hình ứng dụng
 */
export const CONFIG = {
  // URL gốc của Backend API
  API_BASE_URL: "https://pyramidally-unborrowed-cherie.ngrok-free.dev",

  // Tiền tố API cho các endpoint dashboard
  API_PREFIX: "/api/v1/dashboard",

  // Tự động chuyển sang mock data nếu đã fallback
  get USE_MOCK() {
    // Set to true for FE-only testing without backend
    return false;
  },

  // Các khóa lưu trữ trong LocalStorage
  STORAGE_KEYS: {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    TOKEN: "auth_token",  // Legacy - kept for backward compatibility
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
  PUBLIC_ROUTES: ["/login", "/register-owner", "/register-staff", "/register-pending", "/forgot-password", "/"],

  // Trạng thái đặt bàn
  BOOKING_STATUS: {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    CHECKED_IN: "CHECKED_IN",
    NO_SHOW: "NO_SHOW",
  },

  // Loại thông báo (Match with BE constants/notification.js)
  NOTIFICATION_TYPES: {
    BOOKING_CREATED: "BOOKING_CREATED",
    BOOKING_UPDATED: "BOOKING_UPDATED",
    BOOKING_CANCELLED: "BOOKING_CANCELLED",
    BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
    BOOKING_CHECKED_IN: "BOOKING_CHECKED_IN",
    BOOKING_NO_SHOW: "BOOKING_NO_SHOW",
    BOOKING_PAYMENT_SUCCESS: "BOOKING_PAYMENT_SUCCESS",
    BOOKING_PAYMENT_FAILED: "BOOKING_PAYMENT_FAILED",
    BOOKING_REFUND_SUCCESS: "BOOKING_REFUND_SUCCESS",
    BOOKING_REMINDER: "BOOKING_REMINDER",
    STAFF_REGISTERED: "STAFF_REGISTERED",
    STAFF_STATUS_CHANGED: "STAFF_STATUS_CHANGED",
    REVIEW_CREATED: "REVIEW_CREATED",
    GENERIC: "GENERIC",
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
