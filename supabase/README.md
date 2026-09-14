# Supabase

Thư mục này chứa schema database cho website Chạm A Lưới.

## Cách tạo database

1. Vào Supabase Dashboard.
2. Tạo project mới.
3. Mở `SQL Editor`.
4. Copy nội dung file `supabase/schema.sql`.
5. Chạy SQL để tạo bảng, enum, trigger và policy.

## Biến môi trường

Copy `.env.example` thành `.env.local`, sau đó điền:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở server/API route, không đưa vào client component.

## Đăng nhập Google

1. Vào Supabase Dashboard.
2. Mở `Authentication` -> `Providers`.
3. Bật `Google`.
4. Điền Google Client ID và Client Secret.
5. Trong `Authentication` -> `URL Configuration`, thêm redirect URL:

```text
http://localhost:3000/auth/callback
```

Khi deploy Vercel, thêm tiếp URL production:

```text
https://ten-mien-cua-ban.vn/auth/callback
```

## Đăng nhập Gmail/email và số điện thoại

- Bật `Email` trong `Authentication` -> `Providers` để dùng email + mật khẩu.
- Bật `Phone` trong `Authentication` -> `Providers` để dùng OTP qua số điện thoại.
- Đăng nhập số điện thoại cần cấu hình SMS provider trong Supabase, ví dụ Twilio hoặc provider mà Supabase hỗ trợ.
