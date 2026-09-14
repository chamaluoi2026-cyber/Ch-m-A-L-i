# Chạm A Lưới - Nền tảng Du lịch Cộng đồng A Lưới

Nền tảng trung gian kết nối du khách với các doanh nghiệp, hợp tác xã, homestay, điểm ăn uống, vui chơi và du lịch cộng đồng tại huyện vùng cao A Lưới, Thừa Thiên Huế.

---

## 1. Mô hình vận hành cốt lõi

Website không trực tiếp bán toàn bộ tour mà đóng vai trò **nền tảng trung gian kết nối và bảo đảm chất lượng**:
```
Khách tìm địa điểm / dịch vụ
  ↳ Xem chi tiết, đánh giá, vị trí bản đồ, gọi điện
  ↳ Điền form để lại thông tin tư vấn & nhu cầu
  ↳ Nhận Lead ID (AL-LD-XXXXX) và Voucher Code (CAL-VCH-XXXXX) độc quyền
  ↳ Mở khóa nút chat Zalo trực tiếp với chủ cơ sở
  ↳ Khách đến sử dụng dịch vụ tại cơ sở
  ↳ Doanh nghiệp xác nhận voucher & nhập giá trị đơn hàng thực tế
  ↳ Website ghi nhận doanh thu & tự động tính hoa hồng (commission_amount = order_value * commission_rate / 100)
  ↳ Quản trị viên và Doanh nghiệp đối soát & quyết toán định kỳ
```

> **Lưu ý bảo mật**: Tỷ lệ và số tiền hoa hồng tuyệt đối **không hiển thị** cho khách hàng trên toàn bộ giao diện công khai, chỉ hiển thị trong khu vực Quản trị Admin (`/admin`) và Doanh nghiệp (`/business`).

---

## 2. Công nghệ sử dụng

- **Framework**: Next.js 15 App Router + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui primitives
- **Animation & Icons**: Framer Motion + Lucide React
- **Backend Logic**: Next.js Server Actions + Persistent Central Server Store
- **Database**: Supabase PostgreSQL 17 bảng với Row Level Security (RLS) & Triggers

---

## 3. Hệ thống Routes & Trang chức năng

### 3.1. Phân hệ Du khách (Công khai)
- `/` - Trang chủ: Giới thiệu A Lưới, danh lam thắng cảnh, nét văn hóa bản địa.
- `/places` - Danh sách 13 nhóm địa điểm: Ăn uống, Lưu trú, Vui chơi, Trải nghiệm, Thác và suối, Hoạt động ngoài trời, Lửa trại, Khu du lịch cộng đồng, Tham quan, Văn hóa, Đặc sản, Dịch vụ khác.
- `/places/[slug]` - Trang chi tiết địa điểm: Thanh nút hành động nhanh (Nhận voucher, Tư vấn, Xem bản đồ, Gọi điện, Khóa nút Zalo đến khi nhận voucher), ảnh thực tế, hoạt động tại điểm, đối tượng phù hợp, lưu ý an toàn.
- `/account` - Hồ sơ cá nhân: Kho voucher của tôi, Lịch sử tư vấn (Leads), Yêu cầu tour và Địa điểm quan tâm.
- `/book-tour` - Đặt tour trọn gói & Du lịch tự túc.
- `/products` & `/products/[slug]` - Danh mục đặc sản địa phương & form đặt hàng.
- `/blog` & `/blog/[slug]` - Bài viết & cẩm nang du lịch vùng cao.
- `/login` & `/auth/callback` - Đăng nhập Google, Email và Số điện thoại.
- `/about` - Giới thiệu sứ mệnh và tác động cộng đồng.

### 3.2. Phân hệ Quản trị Admin (`/admin`)
- `/admin` - Dashboard tổng quan: 8 chỉ số KPI, Tổng doanh thu cơ sở tạo ra, Tổng hoa hồng, Hoa hồng chưa đối soát, Leads mới nhất và Giao dịch gần đây.
- `/admin/businesses` - Quản lý danh sách doanh nghiệp đối tác, người đại diện, liên hệ và tỷ lệ hoa hồng thỏa thuận.
- `/admin/places` - Quản lý tất cả địa điểm, trạng thái mở cửa (`active`/`temporarily_closed`), danh mục và hoa hồng.
- `/admin/leads` - Quản lý danh sách Lead khách hàng, bộ lọc trạng thái (Mới, Đang tư vấn, Đã chốt, Đã dùng voucher, Hết hạn) và cập nhật trực tiếp.
- `/admin/vouchers` - Quản lý kho voucher, thời hạn, tra cứu mã và theo dõi trạng thái sử dụng.
- `/admin/transactions` - Nhật ký giao dịch phát sinh từ voucher trên toàn hệ thống.
- `/admin/commissions` - **Trung tâm Đối soát Hoa hồng**: Bộ lọc theo cơ sở, tính tổng doanh số, tổng hoa hồng và nút xác nhận đã quyết toán.
- `/admin/orders` - Quản lý đơn đặt tour và đơn mua đặc sản địa phương.
- `/admin/users` - Quản lý tài khoản và phân quyền 3 vai trò (`customer`, `business`, `admin`).

### 3.3. Phân hệ Cơ sở / Doanh nghiệp (`/business`)
- `/business` - Dashboard riêng của cơ sở: Số Lead được giới thiệu, Số voucher đang lưu, Doanh thu tháng và Hoa hồng phải thanh toán.
- `/business/vouchers` - **Công cụ Xác nhận Voucher & Hóa đơn**:
  1. Nhập mã voucher khách cung cấp -> Tra cứu thẩm định tính hợp lệ.
  2. Nhập số tiền hóa đơn thực tế (`order_value`).
  3. Hệ thống tự động tính hoa hồng: `commission_amount = order_value * commission_rate / 100`.
  4. Xác nhận đã dùng voucher và tạo bản ghi đối soát ngay lập tức.
- `/business/leads` - Danh sách khách hàng đã để lại nhu cầu riêng cho cơ sở mình kèm SĐT và link mở Zalo tư vấn.
- `/business/places` - Quản lý các địa điểm, hình ảnh và dịch vụ của cơ sở.
- `/business/transactions` - Lịch sử các giao dịch đã chốt và số tiền hoa hồng cần thanh toán cho ban quản trị.
- `/business/profile` - Cập nhật người đại diện, số hotline, link Zalo và địa chỉ đón khách.

---

## 4. Dữ liệu mẫu 14 Địa điểm thực tế tại A Lưới

1. **Thác A Nôr** (Thác và suối) - Thác nước 3 tầng tự nhiên giữa rừng già Hồng Kim.
2. **Suối A Lin** (Thác và suối) - Suối đá nước trong xanh, bãi tắm an toàn tại Hồng Trung.
3. **Suối Pâr Le** (Thác và suối) - Vịnh tắm ngọc bích, điểm nhảy thác tại Hồng Hạ.
4. **Rừng nguyên sinh A Roàng** (Hoạt động ngoài trời) - Tuyến trekking Trường Sơn & ngâm suối khoáng nóng.
5. **Làng du lịch cộng đồng A Nôr** (Khu du lịch cộng đồng) - Làng kiểu mẫu ngủ nhà sàn, làm bánh A Quát, giã gạo.
6. **Lửa trại và văn nghệ địa phương** (Lửa trại) - Đêm hội cồng chiêng, múa Ra Zooc, uống rượu cần.
7. **Homestay ven suối A Nôr** (Lưu trú) - Nhà sàn gỗ ven suối reo, không khí trong lành.
8. **Quán cơm bản Pa Cô** (Ăn uống) - Mâm cơm cơm lam, gà đồi nướng than hoa, rau dớn rừng.
9. **Trải nghiệm dệt Zèng Tà Ôi** (Văn hóa) - Workshop dệt thổ cẩm đính cườm di sản quốc gia.
10. **Cầu treo Pi Lung & Check-in** (Tham quan) - Cầu treo bắc qua sông ngắm hoàng hôn núi rừng.
11. **Dịch vụ xe đưa đón Huế - A Lưới** (Dịch vụ khác) - Xe 7-16 chỗ chuyên tuyến vượt đèo Tà Lương.
12. **Mật ong rừng A Lưới** (Đặc sản) - Mật ong khoái tự nhiên từ rừng già.
13. **Trà núi thảo mộc A Lưới** (Đặc sản) - Búp trà dây rừng thanh nhiệt dạ dày & sâm cau bồi bổ.
14. **Đặc sản thịt bò gác bếp & Rượu cần** (Đặc sản) - Thịt bò cỏ gác củi rừng thơm lừng và rượu men lá.

---

## 5. Cấu trúc Database Supabase (17 Bảng)

File `supabase/schema.sql` đã được hoàn thiện đầy đủ với khóa ngoại, RLS Policies và Triggers:
1. `profiles` - Hồ sơ người dùng và vai trò.
2. `businesses` - Cơ sở kinh doanh, tỷ lệ hoa hồng mặc định.
3. `places` - Địa điểm, danh mục, giá, dịch vụ, hoạt động, an toàn.
4. `place_images` - Thư viện ảnh chi tiết.
5. `place_services` - Bảng dịch vụ và giá chi tiết.
6. `place_leads` - Lead tư vấn của khách và mã Voucher gắn kèm.
7. `vouchers` - Bảng mã ưu đãi, hạn dùng, trạng thái `unused`/`used`.
8. `transactions` - Giao dịch thực tế khi khách dùng voucher.
9. `commission_records` - Bản kê hoa hồng đối soát định kỳ.
10. `tour_packages` - Gói tour trọn gói.
11. `tour_requests` - Yêu cầu đặt tour của khách.
12. `homestays` - Cơ sở lưu trú cộng đồng.
13. `experiences` - Trải nghiệm bổ sung.
14. `products` - Danh mục sản phẩm đặc sản.
15. `product_orders` - Đơn đặt mua đặc sản.
16. `chat_conversations` & `chat_messages` - Tin nhắn tư vấn trực tuyến.
17. `notifications` - Thông báo hệ thống cho Admin & Doanh nghiệp.

---

## 6. Hướng dẫn chạy & Kiểm thử

```bash
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển
npm run dev

# Kiểm tra biên dịch production
npm run build
```

Mở trình duyệt:
- Khách hàng: `http://localhost:3000`
- Trang địa điểm: `http://localhost:3000/places`
- Cổng Quản trị Admin: `http://localhost:3000/admin`
- Cổng Doanh nghiệp: `http://localhost:3000/business`
- Công cụ xác nhận voucher: `http://localhost:3000/business/vouchers`
