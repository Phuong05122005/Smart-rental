# Use Case: Đăng nhập hệ thống

**Description:** Người dùng đăng nhập vào hệ thống để truy cập các tính năng.

**Precondition:** Người dùng có tài khoản hợp lệ.

**Postcondition:** Người dùng đã được xác thực và vào hệ thống.

## Actors
- **User**

## Data Entities
- **User Account**

## Flows
### EXCEPTION: Thông tin đăng nhập không hợp lệ
1. Người dùng nhập sai thông tin đăng nhập. 2. Hệ thống hiển thị thông báo lỗi. 3. Người dùng nhập lại.

### MAIN
1. Người dùng nhập tên đăng nhập và mật khẩu. 2. Hệ thống kiểm tra thông tin trong cơ sở dữ liệu. 3. Hệ thống xác thực và cấp quyền truy cập theo vai trò. 4. Hệ thống hiển thị Dashboard chính.

## Business Rules
- Hệ thống cho phép tối đa 5 lần đăng nhập sai trước khi khóa tài khoản tạm thời
- Tên đăng nhập và mật khẩu là bắt buộc

