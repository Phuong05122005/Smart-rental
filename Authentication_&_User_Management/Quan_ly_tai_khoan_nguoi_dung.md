# Use Case: Quản lý tài khoản người dùng

**Description:** Admin quản lý tài khoản người dùng, tạo, sửa, khóa tài khoản.

**Precondition:** Quản trị viên đã đăng nhập hệ thống với quyền cao nhất.

**Postcondition:** Tài khoản người dùng được tạo, cập nhật hoặc khóa theo yêu cầu của Quản trị viên.

## Actors
- **Quản trị viên**

## Data Entities
- **User Account**

## Flows
### EXCEPTION: Tên đăng nhập trùng lặp
Khi Admin tạo tài khoản mới với Tên đăng nhập đã tồn tại, hệ thống báo lỗi: 'Tên đăng nhập đã được sử dụng' và yêu cầu Admin nhập lại.

### MAIN: MAIN
1. Quản trị viên chọn 'Quản lý tài khoản' trong menu hệ thống.
2. Quản trị viên chọn thao tác: Tạo mới, Chỉnh sửa, hoặc Khóa tài khoản.
3. Nếu Tạo mới: Quản trị viên nhập thông tin (Tên đăng nhập, Mật khẩu, Vai trò, Thông tin cá nhân). Hệ thống kiểm tra dữ liệu và lưu tài khoản.
4. Nếu Chỉnh sửa: Quản trị viên cập nhật vai trò hoặc thông tin cá nhân của tài khoản. Hệ thống lưu thay đổi.
5. Nếu Khóa: Quản trị viên chọn 'Khóa tài khoản'. Hệ thống cập nhật trạng thái tài khoản thành 'Bị khóa' và người dùng đó không thể đăng nhập.

## Business Rules
- Chỉ Quản trị viên mới có quyền tạo hoặc khóa tài khoản của người dùng khác
- Mật khẩu phải có tối thiểu 8 ký tự, bao gồm cả chữ và số
- Tên đăng nhập (username) phải là duy nhất trong hệ thống

