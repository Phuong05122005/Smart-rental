# Use Case: Gửi thông báo tự động

**Description:** Tự động gửi thông báo nhắc lịch đóng tiền hoặc hết hạn hợp đồng

**Precondition:** Hệ thống có cấu hình các mốc thời gian nhắc nhở.

**Postcondition:** Thông báo được tạo và lưu trong hệ thống, người dùng nhận được thông báo.

## Actors
- **Hệ thống**

## Data Entities
- **Hợp đồng**
- **Thông báo**

## Flows
### ALT: Không có thông báo mới
Hệ thống không tìm thấy hợp đồng nào đến hạn, dừng quy trình.

### MAIN
Hệ thống kiểm tra các hợp đồng sắp đến hạn thanh toán hoặc sắp hết hạn. Hệ thống tự động tạo nội dung thông báo. Hệ thống gửi thông báo đến tài khoản người dùng tương ứng.

## Business Rules
- Thông báo phải bao gồm nội dung cụ thể về sự kiện
- Thông báo phải được gửi ít nhất 3 ngày trước hạn đóng tiền hoặc hết hạn hợp đồng

