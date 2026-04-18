# 💰 Quản Lý Chi Tiêu Cá Nhân

## Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (cloud, free)
- **Deploy**: Render.com (free)

## Cài đặt local

```bash
# 1. Cài dependencies
npm install

# 2. Tạo .env
cp .env.example .env
# Điền MONGODB_URI vào .env

# 3. Tạo dữ liệu mẫu
npm run seed

# 4. Chạy server
npm run dev
```

## Deploy lên Render.com

1. Push code lên GitHub
2. Vào Render.com → New → Web Service → chọn repo
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Thêm Environment Variable: `MONGODB_URI` = connection string Atlas
6. Deploy!

## API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/ky-thang/hien-tai` | Kỳ tháng hiện tại |
| GET | `/api/giao-dich?thang=4&nam=2026` | Giao dịch theo tháng |
| POST | `/api/giao-dich` | Thêm giao dịch |
| PUT | `/api/giao-dich/:id` | Sửa giao dịch |
| DELETE | `/api/giao-dich/:id` | Xoá giao dịch |
| GET | `/api/danh-muc` | Danh mục |
| GET | `/api/bao-cao/thang?thang=4&nam=2026` | Báo cáo tháng |
| GET | `/api/bao-cao/nam?nam=2026` | Báo cáo năm |
| POST | `/api/ky-thang/:id/chot` | Chốt tháng |
