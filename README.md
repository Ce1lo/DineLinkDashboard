# 🍽️ Restaurant Dashboard - Frontend

Ứng dụng Dashboard dành cho chủ nhà hàng và nhân viên, được xây dựng theo kiến trúc Single Page Application (SPA) sử dụng Vanilla JavaScript và Handlebars templates.

## 🚀 Tính năng chính

- **Quản lý đặt bàn (Bookings)**: Xem, xác nhận, hủy và theo dõi trạng thái đặt bàn.
- **Quản lý sơ đồ bàn (Tables)**: Quản lý danh sách bàn và trạng thái bàn (Trống/Đang dùng).
- **Quản lý đánh giá (Reviews)**: Phản hồi các đánh giá từ khách hàng.
- **Thông báo thời gian thực**: Nhận thông báo về các sự kiện mới (Đặt bàn mới, Đăng ký nhân viên...).
- **Hệ thống Mock Data**: Cho phép phát triển UI mà không cần Backend.

## 🛠️ Công nghệ sử dụng

- **Hệ điều hành**: Vanilla JavaScript (ES6+)
- **Templating**: Handlebars.js
- **Styling**: Vanilla CSS (Modern CSS variables, Flexbox/Grid)
- **Tooling**: live-server (Dev server), Lucide Icons
- **Kiến trúc**: Service-View pattern

## � Hướng dẫn cài đặt (Getting Started)

Nếu bạn vừa clone dự án này về máy, hãy thực hiện các bước sau để chạy:

1.  **Cài đặt NodeJS**: Đảm bảo máy đã cài NodeJS (khuyên dùng bản LTS).
2.  **Cài đặt thư viện**:
    ```bash
    npm install
    ```
3.  **Thiết lập môi trường**:
    - Copy file `.env.example` thành file mới tên là `.env`.
    - Mở file `.env` và cập nhật `API_BASE_URL` trỏ về link Backend của bạn.
    ```bash
    cp .env.example .env  # Hoặc copy tay trên Windows
    ```
4.  **Chạy ứng dụng**:
    ```bash
    npm run dev
    ```

## �📁 Cấu trúc thư mục

| Thư mục                                     | Chức năng                                             |
| :------------------------------------------ | :---------------------------------------------------- |
| [`/src`](./src/README.md)                   | Chứa mã nguồn logic chính (App, Router, Config)       |
| [`/src/views`](./src/views/README.md)       | Logic điều khiển UI và xử lý sự kiện cho từng trang   |
| [`/src/services`](./src/services/README.md) | Xử lý gọi API và nghiệp vụ dữ liệu                    |
| [`/templates`](./templates/README.md)       | Giao diện Handlebars (.hbs)                           |
| [`/scripts`](./scripts/README.md)           | Các công cụ hỗ trợ phát triển (Toggle Mock, Sync Env) |
| `/assets`                                   | Tài nguyên tĩnh (Hình ảnh, Icons)                     |
| `/css`                                      | File định kiểu giao diện                              |

## ⚙️ Cấu hình môi trường (.env)

Dự án sử dụng cơ chế đồng bộ `.env` vào `config.js`.

- `API_BASE_URL`: Link Backend API.
- `USE_MOCK`: Chọn `true` để dùng dữ liệu giả, `false` để dùng API thật.

## 🛠️ Lệnh chạy (Scripts)

- `npm run dev`: Chạy server phát triển (Cổng 3000). Tự động đồng bộ cấu hình từ `.env`.
- `npm run mock`: Chuyển nhanh sang chế độ Mock Data.
- `npm run prod`: Chuyển nhanh sang chế độ Production (API thật).
- `npm run sync`: Chỉ đồng bộ cấu hình từ `.env` vào dự án.
- `npm run status`: Kiểm tra trạng thái hiện tại (Mock hay Prod).
