# Admin Booking APIs Documentation

## Tổng quan
Đã tạo 3 API endpoints mới cho quản lý booking từ phía admin:

## 1. API Lấy danh sách Booking cho Admin

### Endpoint
```
GET /api/bookings/admin/list
```

### Parameters
- `search` (optional): Tìm kiếm theo tên, SĐT, email hoặc số phòng
- `status` (optional): Lọc theo trạng thái (CONFIRMED, CHECKED-IN, etc.)
- `page` (default: 0): Số trang
- `size` (default: 10): Số lượng item mỗi trang
- `sort` (default: createAt): Trường sắp xếp
- `direction` (default: desc): Hướng sắp xếp (asc/desc)

### Response
```json
{
  "content": [
    {
      "bookingId": 1,
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0123456789",
      "customerEmail": "test@example.com",
      "roomNumber": "101",
      "roomTypeName": "Deluxe Room",
      "checkinDate": "2024-01-15T14:00:00",
      "checkoutDate": "2024-01-17T12:00:00",
      "status": "CONFIRMED",
      "deposit": 500000,
      "createAt": "2024-01-10T10:00:00",
      "numberOfGuests": 2
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0
}
```

## 2. API Lấy chi tiết Booking cho Admin

### Endpoint
```
GET /api/bookings/admin/detail/{bookingId}
```

### Response
```json
{
  "bookingId": 1,
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0123456789",
  "customerEmail": "test@example.com",
  "customerCitizenId": "123456789",
  "roomNumber": "101",
  "roomTypeName": "Deluxe Room",
  "roomPrice": 1000000,
  "checkinDate": "2024-01-15T14:00:00",
  "checkoutDate": "2024-01-17T12:00:00",
  "actualCheckin": "2024-01-15T14:30:00",
  "actualCheckout": null,
  "status": "CHECKED-IN",
  "deposit": 500000,
  "createAt": "2024-01-10T10:00:00",
  "numberOfGuests": 2,
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0123456789",
  "contactEmail": "test@example.com",
  "guestDetails": [
    {
      "guestDetailId": 1,
      "fullName": "Nguyễn Thị B",
      "gender": "Female",
      "citizenId": "987654321"
    }
  ],
  "serviceRequests": [
    {
      "serviceRequestId": 1,
      "serviceName": "Massage",
      "quantity": 2,
      "unitPrice": 300000,
      "totalPrice": 600000,
      "status": "CONFIRMED"
    }
  ]
}
```

## 3. API Cập nhật Booking cho Admin

### Endpoint
```
PUT /api/bookings/admin/update/{bookingId}
```

### Request Body
```json
{
  "bookingId": 1,
  "roomId": 102,
  "checkinDate": "2024-01-15T14:00:00",
  "checkoutDate": "2024-01-17T12:00:00",
  "status": "CONFIRMED",
  "deposit": 500000,
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0123456789",
  "contactEmail": "test@example.com",
  "guestDetails": [
    {
      "guestDetailId": null,
      "fullName": "Nguyễn Thị B",
      "gender": "Female",
      "citizenId": "987654321",
      "action": "CREATE"
    },
    {
      "guestDetailId": 1,
      "fullName": "Nguyễn Thị C",
      "gender": "Female",
      "citizenId": "111222333",
      "action": "UPDATE"
    },
    {
      "guestDetailId": 2,
      "fullName": null,
      "gender": null,
      "citizenId": null,
      "action": "DELETE"
    }
  ]
}
```

### Response
```json
{
  "message": "Cập nhật booking thành công"
}
```

## Các file đã tạo/cập nhật

### DTOs mới:
1. `AdminBookingListDTO.java` - DTO cho danh sách booking
2. `AdminBookingDetailDTO.java` - DTO cho chi tiết booking với GuestDetails
3. `AdminBookingUpdateDTO.java` - DTO cho cập nhật booking

### Repository cập nhật:
1. `GuestDetailRepository.java` - Thêm các query methods
2. `BookingRepository.java` - Thêm admin queries với pagination

### Service cập nhật:
1. `BookingService.java` - Thêm 3 methods admin:
   - `getBookingsForAdmin()` - Lấy danh sách với pagination
   - `getBookingDetailForAdmin()` - Lấy chi tiết với GuestDetails
   - `updateBookingForAdmin()` - Cập nhật booking và GuestDetails

### Controller cập nhật:
1. `BookingController.java` - Thêm 3 endpoints admin:
   - `GET /admin/list` - Danh sách booking
   - `GET /admin/detail/{id}` - Chi tiết booking
   - `PUT /admin/update/{id}` - Cập nhật booking

## Tính năng chính

### 1. Phân trang và tìm kiếm
- Hỗ trợ phân trang với Spring Data Pageable
- Tìm kiếm theo tên, SĐT, email, số phòng
- Lọc theo trạng thái booking
- Sắp xếp theo các trường khác nhau

### 2. Quản lý GuestDetails
- Xem danh sách khách đi cùng
- Thêm/sửa/xóa thông tin khách đi cùng
- Validation và kiểm tra trùng lặp

### 3. Cập nhật booking linh hoạt
- Thay đổi phòng
- Cập nhật ngày check-in/out
- Thay đổi trạng thái
- Cập nhật thông tin liên hệ

## Sử dụng trong Frontend

Các API này có thể được sử dụng trong `BookingManagement.jsx` để:
1. Hiển thị danh sách booking với pagination
2. Xem chi tiết booking khi click vào một booking
3. Cập nhật thông tin booking và GuestDetails

## Lưu ý
- Tất cả endpoints đều không yêu cầu authentication (có thể thêm sau)
- GuestDetails được quản lý theo từng action riêng biệt (CREATE, UPDATE, DELETE)
- Cần kiểm tra quyền admin trước khi gọi các API này

## Logic xử lý GuestDetails

### CREATE
- Tạo mới GuestDetail với `guestDetailId = null`
- Tự động generate ID mới khi save

### UPDATE  
- Cập nhật GuestDetail hiện có với `guestDetailId` có giá trị
- Giữ nguyên ID, chỉ cập nhật thông tin

### DELETE
- Xóa GuestDetail với `guestDetailId` có giá trị
- Xóa hoàn toàn khỏi database
