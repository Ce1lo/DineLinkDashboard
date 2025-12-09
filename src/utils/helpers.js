/**
 * Handlebars Helpers - Các hàm hỗ trợ cho template Handlebars
 * Dùng trong các file .hbs với cú pháp: {{helperName value}}
 */

// Đăng ký tất cả helpers tùy chỉnh
export function registerHandlebarsHelpers() {
    
    // ==================== ĐỊNH DẠNG NGÀY GIỜ ====================
    
    /**
     * Định dạng ngày: 2024-12-04 -> 04/12/2024
     * Sử dụng: {{formatDate dateValue}}
     */
    Handlebars.registerHelper('formatDate', function(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    });

    /**
     * Định dạng giờ: 2024-12-04T11:30:00 -> 11:30
     * Sử dụng: {{formatTime dateValue}}
     */
    Handlebars.registerHelper('formatTime', function(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    });

    /**
     * Định dạng ngày giờ: 2024-12-04T11:30:00 -> 04/12/2024 11:30
     * Sử dụng: {{formatDateTime dateValue}}
     */
    Handlebars.registerHelper('formatDateTime', function(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN') + ' ' + 
               date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    });

    /**
     * Định dạng tiền tệ: 200000 -> 200.000 ₫
     * Sử dụng: {{formatCurrency amount}}
     */
    Handlebars.registerHelper('formatCurrency', function(amount) {
        if (!amount && amount !== 0) return '';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    });

    /**
     * Hiển thị thời gian từ lúc xảy ra: "5 phút trước", "2 giờ trước"
     * Sử dụng: {{timeAgo dateValue}}
     */
    Handlebars.registerHelper('timeAgo', function(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // Số giây đã trôi qua
        
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
        if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
        if (diff < 604800) return Math.floor(diff / 86400) + ' ngày trước';
        return date.toLocaleDateString('vi-VN');
    });

    // ==================== SO SÁNH VÀ ĐIỀU KIỆN ====================

    /**
     * Kiểm tra bằng nhau: {{#if (eq a b)}} ... {{/if}}
     */
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    /**
     * Kiểm tra không bằng: {{#if (neq a b)}} ... {{/if}}
     */
    Handlebars.registerHelper('neq', function(a, b) {
        return a !== b;
    });

    /**
     * Kiểm tra lớn hơn: {{#if (gt a b)}} ... {{/if}}
     */
    Handlebars.registerHelper('gt', function(a, b) {
        return a > b;
    });

    /**
     * Phép trừ: {{subtract a b}}
     * Sử dụng: {{subtract 5 3}} -> 2
     */
    Handlebars.registerHelper('subtract', function(a, b) {
        return (a || 0) - (b || 0);
    });

    /**
     * Phép cộng: {{add a b}}
     * Sử dụng: {{add 2 3}} -> 5
     */
    Handlebars.registerHelper('add', function(a, b) {
        return (a || 0) + (b || 0);
    });

    /**
     * Kiểm tra nhỏ hơn: {{#if (lt a b)}} ... {{/if}}
     */
    Handlebars.registerHelper('lt', function(a, b) {
        return a < b;
    });

    /**
     * Điều kiện OR - trả về true nếu BẤT KỲ tham số nào truthy
     * {{#if (or condition1 condition2)}} ... {{/if}}
     */
    Handlebars.registerHelper('or', function(...args) {
        // Bỏ tham số cuối (options object của Handlebars)
        args.pop();
        return args.some(arg => !!arg);
    });

    /**
     * Điều kiện AND - trả về true nếu TẤT CẢ tham số đều truthy
     * {{#if (and condition1 condition2)}} ... {{/if}}
     */
    Handlebars.registerHelper('and', function(...args) {
        // Bỏ tham số cuối (options object của Handlebars)
        args.pop();
        return args.every(arg => !!arg);
    });

    // ==================== TRẠNG THÁI VÀ GIAO DIỆN ====================

    /**
     * Trả về class CSS cho badge trạng thái
     * Sử dụng: <span class="badge {{statusBadgeClass status}}">
     */
    Handlebars.registerHelper('statusBadgeClass', function(status) {
        const classes = {
            'PENDING': 'bg-warning text-dark',    // Vàng - Chờ xác nhận
            'CONFIRMED': 'bg-success',            // Xanh lá - Đã xác nhận
            'CANCELLED': 'bg-danger',             // Đỏ - Đã hủy
            'CHECKED_IN': 'bg-info',              // Xanh dương - Đã check-in
            'NO_SHOW': 'bg-secondary',            // Xám - Không đến
            'ACTIVE': 'bg-success',               // Xanh lá - Hoạt động
            'INACTIVE': 'bg-secondary'            // Xám - Tạm ngưng
        };
        return classes[status] || 'bg-secondary';
    });

    /**
     * Trả về text hiển thị cho trạng thái
     * Sử dụng: {{statusText status}}
     */
    Handlebars.registerHelper('statusText', function(status) {
        const texts = {
            'PENDING': 'Chờ xác nhận',
            'CONFIRMED': 'Đã xác nhận',
            'CANCELLED': 'Đã hủy',
            'CHECKED_IN': 'Đã check-in',
            'NO_SHOW': 'Không đến',
            'ACTIVE': 'Hoạt động',
            'INACTIVE': 'Tạm ngưng'
        };
        return texts[status] || status;
    });

    /**
     * Hiển thị sao đánh giá (1-5 sao)
     * Sử dụng: {{{ratingStars rating}}} (3 dấu ngoặc để render HTML)
     */
    Handlebars.registerHelper('ratingStars', function(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="bi bi-star-fill text-warning"></i>'; // Sao đầy
            } else {
                stars += '<i class="bi bi-star text-muted"></i>'; // Sao rỗng
            }
        }
        return new Handlebars.SafeString(stars);
    });

    /**
     * Trả về icon tương ứng với loại thông báo
     * Sử dụng: <i class="bi {{notificationIcon type}}"></i>
     */
    Handlebars.registerHelper('notificationIcon', function(type) {
        const icons = {
            'BOOKING_CREATED': 'bi-calendar-plus text-primary',    // Có đặt bàn mới
            'BOOKING_CONFIRMED': 'bi-calendar-check text-success', // Xác nhận thành công
            'BOOKING_CANCELLED': 'bi-calendar-x text-danger',      // Hủy đặt bàn
            'REVIEW_CREATED': 'bi-star text-warning'               // Có đánh giá mới
        };
        return icons[type] || 'bi-bell text-secondary';
    });

    // ==================== XỬ LÝ CHUỖI VÀ MẢNG ====================

    /**
     * Giá trị mặc định khi value rỗng
     * Sử dụng: {{default value "Chưa có dữ liệu"}}
     */
    Handlebars.registerHelper('default', function(value, defaultValue) {
        return value || defaultValue;
    });

    /**
     * Chuyển object thành JSON string (dùng để debug)
     * Sử dụng: <pre>{{json data}}</pre>
     */
    Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context, null, 2);
    });

    /**
     * Lặp n lần
     * Sử dụng: {{#times 5}}...{{/times}}
     */
    Handlebars.registerHelper('times', function(n, block) {
        let result = '';
        for (let i = 0; i < n; i++) {
            result += block.fn(i);
        }
        return result;
    });

    /**
     * Kiểm tra mảng có chứa giá trị
     * Sử dụng: {{#if (includes array value)}} ... {{/if}}
     */
    Handlebars.registerHelper('includes', function(array, value) {
        return Array.isArray(array) && array.includes(value);
    });

    /**
     * Lấy độ dài mảng
     * Sử dụng: {{length array}}
     */
    Handlebars.registerHelper('length', function(array) {
        return Array.isArray(array) ? array.length : 0;
    });

    /**
     * Cắt ngắn chuỗi và thêm "..."
     * Sử dụng: {{truncate description 100}}
     */
    Handlebars.registerHelper('truncate', function(str, len) {
        if (!str) return '';
        if (str.length <= len) return str;
        return str.substring(0, len) + '...';
    });

    /**
     * Cắt chuỗi con
     * Sử dụng: {{substring str 0 10}}
     */
    Handlebars.registerHelper('substring', function(str, start, end) {
        if (!str) return '';
        return str.substring(start, end);
    });

    /**
     * Nối mảng thành chuỗi
     * Sử dụng: {{join array ", "}}
     */
    Handlebars.registerHelper('join', function(array, separator) {
        if (!Array.isArray(array)) return '';
        return array.join(separator);
    });
}
