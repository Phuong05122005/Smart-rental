# Use Case: Tra cứu lịch sử hoạt động

**Description:** Quản trị viên tra cứu lịch sử thao tác của nhân viên/người dùng

**Precondition:** Quản trị viên đã đăng nhập hệ thống.

**Postcondition:** Hệ thống hiển thị đúng danh sách log theo bộ lọc.

## Actors
- **Quản trị viên**

## Data Entities
- **AuditLog**

## Flows
### ALT: Không tìm thấy kết quả
Kết quả tìm kiếm không tìm thấy log. Hệ thống hiển thị thông báo 'Không tìm thấy dữ liệu'.

### MAIN
Quản trị viên chọn xem lịch sử hoạt động. Hệ thống yêu cầu bộ lọc (thời gian, người dùng, loại hành động). Quản trị viên nhập thông tin lọc. Hệ thống hiển thị kết quả log khớp với bộ lọc.

## Business Rules
- Log hoạt động phải lưu lại: Thời gian, Actor, Loại hành động, Đối tượng bị tác động, Giá trị cũ, Giá trị mới
- Log hoạt động không được phép xóa hoặc sửa đổi bởi bất kỳ ai

