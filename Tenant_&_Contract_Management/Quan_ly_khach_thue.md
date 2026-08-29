# Use Case: Quản lý khách thuê

**Description:** CRUD cho thông tin khách thuê

**Precondition:** Người dùng đã đăng nhập hệ thống

**Postcondition:** Thông tin khách thuê được lưu vào hệ thống

## Actors
- **Nhân viên**
- **Chủ nhà trọ**

## Data Entities
- **Khách thuê**

## Flows
### ALT: Dữ liệu trùng lặp
Số CCCD/Passport đã tồn tại. Hệ thống thông báo lỗi và yêu cầu nhập lại.

### MAIN
Chủ nhà trọ/Nhân viên chọn chức năng thêm khách thuê. Nhập thông tin: Họ tên, Số CCCD/Passport, Số điện thoại, Email, Hình ảnh giấy tờ tùy thân. Hệ thống kiểm tra tính duy nhất của Số CCCD/Passport. Hệ thống lưu thông tin khách thuê.

## Business Rules
- Các trường thông tin bắt buộc: Họ tên, Số CCCD, Số điện thoại
- Số CCCD/Passport phải là duy nhất

