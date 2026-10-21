# TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS)

# 1. Thông tin đề tài

## Tên đề tài

**Hệ thống Website Bán Quần Áo Trực Tuyến (Online Clothing Store)**

## Mô tả

Xây dựng một website thương mại điện tử cho phép khách hàng tìm kiếm, xem thông tin, mua sắm quần áo trực tuyến và quản lý tài khoản cá nhân. Hệ thống cần có giao diện thân thiện, dễ sử dụng và đáp ứng các nhu cầu mua sắm cơ bản.

---

# 2. Mục tiêu dự án

Sau khi hoàn thành, hệ thống phải đáp ứng các mục tiêu sau:

- Cung cấp giao diện mua sắm trực tuyến thân thiện với người dùng.
- Hiển thị đầy đủ thông tin sản phẩm.
- Hỗ trợ tìm kiếm và lọc sản phẩm nhanh chóng.
- Hỗ trợ mua hàng trực tuyến thông qua giỏ hàng.
- Quản lý thông tin người dùng và lịch sử đơn hàng.
- Áp dụng các kiến thức Frontend/Backend đã học vào dự án thực tế.

---

# 3. Đối tượng sử dụng

## Khách vãng lai (Guest)

Có thể:

- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Tìm kiếm sản phẩm
- Đăng ký tài khoản
- Đăng nhập

## Khách hàng (Customer)

Có thể:

- Thực hiện tất cả chức năng của Guest
- Quản lý giỏ hàng
- Đặt hàng
- Xem lịch sử mua hàng
- Cập nhật thông tin cá nhân

## Quản trị viên (Admin) - Khuyến khích mở rộng

Có thể:

- Quản lý sản phẩm
- Quản lý đơn hàng
- Quản lý người dùng

---

# 4. Functional Requirements

## FR-01: Đăng ký tài khoản

### Input

- Họ tên
- Email
- Số điện thoại
- Mật khẩu
- Xác nhận mật khẩu

### Validation

- Email không được trùng
- Mật khẩu tối thiểu 6 ký tự
- Mật khẩu xác nhận phải khớp

---

## FR-02: Đăng nhập

- Email
- Mật khẩu

---

## FR-03: Xem danh sách sản phẩm

- Hình ảnh
- Tên sản phẩm
- Giá
- Loại sản phẩm
- Phân trang
- Sắp xếp

---

## FR-04: Xem chi tiết sản phẩm

- Hình ảnh sản phẩm
- Tên sản phẩm
- Mô tả
- Giá bán
- Kích cỡ
- Tồn kho
- Thêm vào giỏ hàng

---

## FR-05: Tìm kiếm và lọc sản phẩm

- Tìm theo tên
- Lọc theo danh mục
- Lọc theo giá
- Lọc theo kích cỡ
- Lọc theo thương hiệu

---

## FR-06: Quản lý giỏ hàng

- Thêm sản phẩm
- Xóa sản phẩm
- Cập nhật số lượng
- Xem tổng tiền

---

## FR-07: Đặt hàng

1. Kiểm tra giỏ hàng
2. Nhập thông tin giao hàng
3. Xác nhận đơn hàng
4. Tạo đơn hàng

---

## FR-08: Quản lý tài khoản

- Xem thông tin cá nhân
- Cập nhật hồ sơ
- Đổi mật khẩu

---

## FR-09: Lịch sử đơn hàng

- Mã đơn hàng
- Ngày đặt
- Tổng tiền
- Trạng thái

---

## FR-10: Quản lý sản phẩm (Admin)

- Thêm
- Sửa
- Xóa
- Quản lý tồn kho

---

## FR-11: Quản lý đơn hàng (Admin)

- Xem đơn hàng
- Cập nhật trạng thái
- Tìm kiếm

---

# 5. Non-Functional Requirements

## Hiệu năng

- Tải trang dưới 3 giây
- Hỗ trợ tối thiểu 50 người dùng đồng thời

## Bảo mật

- Mã hóa mật khẩu
- JWT Authentication
- Phân quyền người dùng

## Giao diện

- Responsive Desktop
- Responsive Tablet
- Responsive Mobile

---

# 6. Gợi ý Tech Stack

## Frontend

- Angular 20+
- TypeScript
- TailwindCSS
- Shadcn UI (Angular)
- RxJS

## Backend

- Spring Boot hoặc NestJS

## Database

- MySQL hoặc PostgreSQL

---

# 7. Use Case Chính

## Customer

```text
Đăng ký
   ↓
Đăng nhập
   ↓
Xem sản phẩm
   ↓
Tìm kiếm/Lọc
   ↓
Xem chi tiết
   ↓
Thêm vào giỏ hàng
   ↓
Đặt hàng
   ↓
Xem lịch sử đơn hàng
```

## Admin

```text
Đăng nhập
   ↓
Quản lý sản phẩm
   ↓
Quản lý đơn hàng
   ↓
Quản lý người dùng
```

---

# 8. Phạm vi thực tập (8-10 tuần)

## MVP

- Đăng ký / Đăng nhập
- Danh sách sản phẩm
- Chi tiết sản phẩm
- Tìm kiếm / Lọc
- Giỏ hàng
- Đặt hàng
- Quản lý tài khoản
- Lịch sử đơn hàng

## Bonus

- Dashboard Admin
- Wishlist
- Đánh giá sản phẩm
- Thanh toán online
- Dark Mode
