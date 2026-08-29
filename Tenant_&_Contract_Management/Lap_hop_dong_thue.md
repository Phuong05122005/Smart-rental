# Use Case: Lập hợp đồng thuê

**Description:** Tạo hợp đồng thuê mới cho khách thuê và phòng

**Precondition:** Người dùng đã đăng nhập hệ thống, Phòng đã được thêm vào hệ thống, Khách thuê đã được thêm vào hệ thống

**Postcondition:** Hợp đồng được tạo và trạng thái phòng chuyển thành 'Đã thuê'

## Actors
- **Nhân viên**
- **Chủ nhà trọ**

## Data Entities
- **Khách thuê**
- **Phòng**
- **Hợp đồng**

## Flows
### EXCEPTION: Sai lệch ngày tháng
Ngày kết thúc trước hoặc bằng ngày bắt đầu. Hệ thống thông báo lỗi.

### ALT: Phòng không trống
Phòng không khả dụng (đã có người thuê). Hệ thống thông báo lỗi.

### MAIN
Chủ nhà trọ/Nhân viên chọn chức năng lập hợp đồng. Chọn khách thuê từ danh sách, chọn phòng từ danh sách các phòng trống. Nhập thông tin hợp đồng: Ngày bắt đầu, Ngày kết thúc, Giá thuê, Tiền cọc. Hệ thống kiểm tra các ràng buộc: giá thuê > 0, tiền cọc > 0, ngày kết thúc > ngày bắt đầu. Hệ thống lưu hợp đồng và cập nhật trạng thái phòng thành 'Đã thuê'.

## Business Rules
- Tiền cọc và Giá thuê phải > 0
- Ngày kết thúc phải sau ngày bắt đầu
- Phòng phải đang ở trạng thái 'Trống'

