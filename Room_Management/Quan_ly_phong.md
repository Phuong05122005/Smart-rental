# Use Case: Quản lý phòng

**Description:** Quản lý danh sách, cập nhật thông tin và xóa phòng.

**Precondition:** Người dùng đã đăng nhập hệ thống.

**Postcondition:** Thông tin phòng được cập nhật hoặc phòng được xóa thành công khỏi hệ thống.

## Actors
- **Nhân viên**
- **Chủ nhà trọ**

## Data Entities
- **Room**

## Flows
### EXCEPTION: Xóa phòng khi có hợp đồng
Nếu người dùng cố gắng xóa một phòng đang có hợp đồng hoạt động, hệ thống hiển thị thông báo lỗi: 'Không thể xóa phòng đang có khách thuê' và hủy bỏ thao tác.

### MAIN: MAIN
1. Người dùng chọn chức năng 'Quản lý phòng' từ Dashboard.
2. Hệ thống hiển thị danh sách tất cả các phòng hiện có.
3. Người dùng chọn một phòng để thực hiện thao tác: Cập nhật thông tin hoặc Xóa phòng.
4. Nếu chọn Cập nhật: Người dùng chỉnh sửa các trường thông tin (Giá, Loại phòng, Mô tả, v.v.), sau đó nhấn 'Lưu'. Hệ thống kiểm tra các ràng buộc dữ liệu. Nếu hợp lệ, hệ thống cập nhật thông tin phòng.
5. Nếu chọn Xóa: Người dùng nhấn 'Xóa phòng'. Hệ thống kiểm tra xem phòng có đang gắn với bất kỳ hợp đồng đang hoạt động nào không. Nếu không, hệ thống xóa phòng khỏi cơ sở dữ liệu.

## Business Rules
- Giá phòng sau khi cập nhật phải lớn hơn 0
- Khi cập nhật số phòng, số phòng mới không được trùng với các phòng khác trong hệ thống
- Phòng đang có hợp đồng hoạt động không được phép xóa

