# 💰 Quản Lý Chi Tiêu Cá Nhân

## Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env từ mẫu
cp .env.example .env
# Sau đó mở .env và điền thông tin MySQL của bạn

# 3. Tạo database + bảng
mysql -u root -p < database/schema.sql

# 4. Thêm dữ liệu mẫu (tuỳ chọn)
mysql -u root -p expense_management < database/seed.sql

# 5. Chạy server
npm run dev        # development (auto reload)
npm start          # production
```

## API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/ky-thang/hien-tai` | Kỳ tháng hiện tại |
| GET | `/api/giao-dich?thang=4&nam=2026` | Giao dịch theo tháng |
| POST | `/api/giao-dich` | Thêm giao dịch |
| PUT | `/api/giao-dich/:id` | Sửa giao dịch |
| DELETE | `/api/giao-dich/:id` | Xoá giao dịch |
| GET | `/api/danh-muc?nhom=expense` | Danh mục |
| GET | `/api/bao-cao/thang?thang=4&nam=2026` | Báo cáo tháng |
| GET | `/api/bao-cao/nam?nam=2026` | Báo cáo năm |
| POST | `/api/ky-thang/:id/chot` | Chốt tháng |

## Cấu trúc thư mục

```
expense-app/
├── server.js              ← Entry point
├── .env                   ← Cấu hình (tự tạo từ .env.example)
├── config/
│   ├── database.js        ← MySQL pool
│   └── app.js             ← Express + routes
├── routes/                ← Định nghĩa URL
├── controllers/           ← Xử lý logic
├── models/                ← Query MySQL
├── public/                ← Frontend (HTML/CSS/JS)
└── database/
    ├── schema.sql         ← Tạo bảng
    └── seed.sql           ← Dữ liệu mẫu
```
