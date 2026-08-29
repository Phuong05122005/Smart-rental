# Use Case: Xem thông báo

**Description:** Người dùng xem danh sách thông báo đã nhận

**Precondition:** Người dùng đã đăng nhập hệ thống.

**Postcondition:** Trạng thái thông báo được cập nhật thành 'đã đọc'.

## Actors
- **Nhân viên**
- **Chủ nhà trọ**
- **User**

## Data Entities
- **Thông báo**

## Flows
### ALT: Không có thông báo
Người dùng không có thông báo nào. Hệ thống hiển thị thông báo 'Không có thông báo mới'.

### MAIN
Người dùng truy cập vào phần thông báo. Hệ thống hiển thị danh sách thông báo theo thứ tự thời gian. Người dùng nhấn vào một thông báo để xem chi tiết. Hệ thống cập nhật trạng thái thông báo thành 'đã đọc'.

## Business Rules
- Thông báo chưa đọc được hiển thị trạng thái chưa đọc

