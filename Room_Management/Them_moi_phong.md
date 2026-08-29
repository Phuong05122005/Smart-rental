# Use Case: Thêm mới phòng

**Description:** Thêm thông tin phòng mới vào cơ sở dữ liệu.

**Precondition:** Người dùng đã đăng nhập và được phân quyền quản lý phòng.

**Postcondition:** Thông tin phòng mới được lưu trữ trong hệ thống.

## Actors
- **Nhân viên**
- **Chủ nhà trọ**

## Data Entities
- **Room**

## Flows
### EXCEPTION: Số phòng trùng lặp
1. Người dùng nhập số phòng đã tồn tại. 2. Hệ thống hiển thị thông báo lỗi "Số phòng đã tồn tại". 3. Người dùng nhập lại số phòng khác.

### MAIN
1. Người dùng chọn chức năng thêm mới phòng. 2. Hệ thống hiển thị form nhập: Số phòng (String), Loại phòng (String), Giá phòng (Decimal), Diện tích (Decimal), Mô tả (String). 3. Người dùng nhập thông tin và nhấn "Lưu". 4. Hệ thống kiểm tra tính hợp lệ của dữ liệu (số phòng tồn tại chưa, giá > 0). 5. Hệ thống lưu thông tin phòng vào Database. 6. Hệ thống hiển thị thông báo thành công.

## Business Rules
- Các trường thông tin bắt buộc gồm: Số phòng, Loại phòng, Giá phòng
- Giá phòng phải lớn hơn 0
- Số phòng phải là duy nhất trong hệ thống

