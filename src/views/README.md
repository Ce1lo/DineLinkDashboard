# Views

Thư mục này chứa các **View modules** - mỗi file chịu trách nhiệm xử lý logic render và events cho một trang/nhóm trang cụ thể.

## Cấu trúc

```
views/
├── auth.view.js        # Xử lý login, register-owner, register-staff
├── dashboard.view.js   # Trang tổng quan
├── bookings.view.js    # Quản lý đặt bàn
├── tables.view.js      # Quản lý bàn
├── images.view.js      # Quản lý hình ảnh
├── reviews.view.js     # Quản lý đánh giá
├── notifications.view.js # Thông báo
├── restaurant.view.js  # Thông tin nhà hàng
├── accounts.view.js    # Quản lý tài khoản (dành cho Owner)
└── profile.view.js     # Thông tin cá nhân
```

## Cách hoạt động

Mỗi View module là một object chứa:

- `render(App)`: Hàm render trang, gọi API lấy dữ liệu và render template
- `bindEvents(App)`: Bind các event handlers riêng cho trang đó
- Các hàm xử lý riêng: `handleSubmit()`, `handleDelete()`, v.v.

## Ví dụ

```javascript
const ExampleView = {
  async render(App) {
    const data = await SomeService.getData();
    await App.renderPage("example", data, true);
    this.bindEvents(App);
  },

  bindEvents(App) {
    const form = document.getElementById("exampleForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit(form, App);
      });
    }
  },

  async handleSubmit(form, App) {
    // Xử lý form submit
  },
};
```

## Lợi ích

1. **Separation of Concerns**: Mỗi file lo 1 trang
2. **Easy Maintenance**: Sửa trang nào thì vào file đó
3. **Clean Code**: `app.js` chỉ chứa core logic
4. **Reusability**: Dễ dàng tái sử dụng các pattern
