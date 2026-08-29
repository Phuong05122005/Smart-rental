# Use Case: Xem Báo cáo chi tiết

**Description:** Xem báo cáo chi tiết về doanh thu và phòng trống

**Precondition:** Người dùng đã đăng nhập vào hệ thống.

**Postcondition:** Báo cáo chi tiết được hiển thị.

## Actors
- **Quản trị viên**
- **Chủ nhà trọ**

## Data Entities
- **Contract**
- **RevenueReport**

## Flows
### ALT: Khoảng thời gian không hợp lệ
Nếu khoảng thời gian không hợp lệ, hệ thống báo lỗi và yêu cầu nhập lại.

### MAIN: MAIN
Người dùng chọn loại báo cáo (Doanh thu/Tỷ lệ phòng) và khoảng thời gian. Hệ thống truy xuất dữ liệu chi tiết, tính toán tổng doanh thu hoặc tỷ lệ phòng trống. Hệ thống hiển thị kết quả dưới dạng bảng chi tiết hoặc biểu đồ xu hướng.

## Business Rules
- Dữ liệu doanh thu phải khớp với tổng tiền đã thu từ các Hợp đồng
- Báo cáo chỉ hiển thị cho các khoảng thời gian đã đóng sổ hoặc tháng hiện tại

