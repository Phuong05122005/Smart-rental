# Use Case: Xem Dashboard tổng quan

**Description:** Xem Dashboard tổng quan cho chủ nhà trọ

**Precondition:** Người dùng đã đăng nhập vào hệ thống.

**Postcondition:** Dashboard được hiển thị với các thông số cập nhật mới nhất.

## Actors
- **Quản trị viên**
- **Chủ nhà trọ**

## Data Entities
- **Contract**
- **Room**
- **DashboardData**

## Flows
### ALT: Dữ liệu trống
Nếu chưa có dữ liệu nào trong hệ thống, hệ thống hiển thị thông báo "Chưa có dữ liệu" thay vì biểu đồ.

### MAIN: MAIN
Người dùng truy cập vào Dashboard. Hệ thống truy xuất dữ liệu từ Room và Contract để tổng hợp: Tổng số phòng, số phòng trống, số phòng đã thuê, doanh thu tháng hiện tại, số hợp đồng sắp hết hạn. Hệ thống hiển thị dưới dạng biểu đồ và thẻ thông tin.

## Business Rules
- Doanh thu được tính dựa trên các Hợp đồng đang hoạt động
- Dữ liệu báo cáo phải được cập nhật dựa trên dữ liệu thời gian thực từ Room và Contract
- Chỉ người dùng có quyền quản lý mới xem được Dashboard

