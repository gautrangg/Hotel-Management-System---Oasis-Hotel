# 🎬 KỊch BẢN DEMO - HỆ THỐNG QUẢN LÝ KHÁCH SẠN OASIS

## 📋 Tổng Quan
Kịch bản demo chi tiết cho luồng chính của hệ thống:
- **Khách hàng**: Đăng ký → Book phòng → Thanh toán deposit → Check-in → Sử dụng dịch vụ → Check-out
- **Lễ tân**: Xác nhận check-in → Xác nhận thanh toán
- **Housekeeper**: Dọn phòng

---

## 🔵 PHẦN 1: KHÁCH HÀNG ĐĂNG KÝ TÀI KHOẢN

### Bước 1: Truy cập trang Register
- **URL**: `http://localhost:5173/register`
- **Nút**: Click "Register" trên trang chủ hoặc đường link

### Bước 2: Điền thông tin đăng ký
```
Full Name:        Nguyễn Văn A
Email:            nguyenvana@gmail.com
Phone:            0912345678
Citizen ID:       123456789012
Password:         Pass@123456
```

### Bước 3: Submit form
- Click nút **"Register"**
- Hệ thống gọi: `POST /api/auth/register`
- Kết quả: ✅ "Register successful! Redirecting to login..."
- Tự động chuyển hướng sang trang Login sau 1 giây

---

## 🟢 PHẦN 2: KHÁCH HÀNG ĐĂNG NHẬP & TÌM PHÒNG

### Bước 4: Đăng nhập
- **URL**: `http://localhost:5173/login`
- **Thông tin**:
  ```
  Email:    nguyenvana@gmail.com
  Password: Pass@123456
  ```
- Click **"Login"**
- Hệ thống gọi: `POST /api/auth/login`
- Kết quả: ✅ JWT token lưu vào localStorage, chuyển sang `/home`

### Bước 5: Xem trang chủ
- **URL**: `http://localhost:5173/home`
- Hiển thị:
  - Top 5 phòng nổi bật (API: `GET /api/roomtypes/top5`)
  - Các dịch vụ du lịch
  - Feedback từ khách

### Bước 6: Tìm kiếm phòng
- Click **"Search Rooms"** hoặc vào trang search
- **URL**: `http://localhost:5173/search-room`
- Nhập:
  ```
  Check-in:   2024-12-20
  Check-out:  2024-12-25
  Guests:     2 Adults, 1 Child
  ```
- Click **"Search"**
- Hệ thống gọi: `GET /api/rooms/search?checkin=2024-12-20&checkout=2024-12-25`
- Kết quả: Danh sách phòng khả dụng với giá

### Bước 7: Xem chi tiết phòng
- Click vào phòng (VD: "Deluxe Room")
- **URL**: `http://localhost:5173/room-detail?id=1`
- Hiển thị:
  - Ảnh phòng
  - Giá cơ bản
  - Mô tả, tiện nghi
  - Nút **"Book Now"**
- Hệ thống gọi: `GET /api/roomtypes/1/images`

---

## 💳 PHẦN 3: BOOK PHÒNG & THANH TOÁN DEPOSIT

### Bước 8: Khởi tạo booking
- Từ trang detail, click **"Book Now"**
- Hệ thống gọi: `POST /api/bookings/initiate`
  ```json
  {
    "roomId": 1,
    "checkinDate": "2024-12-20",
    "checkoutDate": "2024-12-25",
    "adult": 2,
    "children": 1
  }
  ```
- Kết quả: `bookingId = 101` (pending)
- Chuyển hướng: `http://localhost:5173/book-room?bid=101`

### Bước 9: Xem chi tiết & xác nhận thông tin
- **Trang**: Booking Confirmation Page
- Hệ thống gọi: `GET /api/bookings/confirmation-details/101`
- Hiển thị:
  ```
  Room Type:      Deluxe Room
  Check-in:       Dec 20, 2024
  Check-out:      Dec 25, 2024
  Number of Nights: 5
  
  Room Price:     $100 × 5 = $500
  Seasonal Fee:   +$50
  Total Price:    $550
  Deposit (30%):  $165
  ```

### Bước 10: Điền thông tin khách hàng
- **Form**:
  ```
  Full Name:      Nguyễn Văn A
  Phone:          0912345678
  Email:          nguyenvana@gmail.com
  ```

### Bước 11: Thanh toán Stripe (Deposit)
- Trang hiển thị Stripe Payment Form
- Nhập thông tin thẻ **TEST**:
  ```
  Card Number:    4242 4242 4242 4242
  Expiry:         12/25
  CVC:            123
  ```
- Click **"Book"** (hoặc "Pay Deposit")
- Hệ thống gọi 2 API:
  1. `POST /api/payment/create-payment-intent` → Tạo payment intent
  2. `POST /api/bookings/confirm` → Xác nhận booking
     ```json
     {
       "bookingId": 101,
       "customerName": "Nguyễn Văn A",
       "customerEmail": "nguyenvana@gmail.com",
       "customerPhone": "0912345678",
       "paymentIntentId": "pi_xxx"
     }
     ```
- Kết quả: ✅ "Booking and payment completed successfully!"
- Chuyển hướng: `http://localhost:5173/my-bookings`

---

## 📱 PHẦN 4: KHÁCH XEM BOOKING & LỄ TÂN QUẢN LÝ CHECK-IN

### Bước 12: Khách xem booking
- **URL**: `http://localhost:5173/my-bookings`
- Hiển thị danh sách booking với trạng thái:
  - ✅ **CONFIRMED** (đã thanh toán 30%)
  - Status: "Waiting for Check-in"
  
### Bước 13: Lễ tân đăng nhập
- **URL**: `http://localhost:5173/staff/login`
- Thông tin:
  ```
  Email:    receptionist@hotel.com
  Password: Receptionist@123
  ```
- Hệ thống gọi: `POST /api/auth/login` (với role = "receptionist")
- Chuyển sang: `http://localhost:5173/staff/check-in-management`

### Bước 14: Lễ tân quản lý Check-in
- **URL**: `http://localhost:5173/staff/check-in-management`
- Hệ thống gọi: `GET /api/bookings/check-in-list`
- Danh sách:
  ```
  Booking ID:  101
  Customer:    Nguyễn Văn A
  Room Type:   Deluxe Room
  Check-in:    Dec 20, 2024, 2:00 PM
  Status:      CONFIRMED - Ready to Check-in
  ```

### Bước 15: Lễ tân xác nhận check-in
- Click vào booking 101 hoặc click **"Check-in"**
- Form hiển thị:
  ```
  Customer Name:    Nguyễn Văn A
  Phone:            0912345678
  Email:            nguyenvana@gmail.com
  Room Type:        Deluxe Room
  Assigned Room:    101 [Dropdown để chọn]
  ```
- (Optional) Nếu khách muốn đổi phòng: `GET /api/bookings/available-rooms?...`
- Click **"Confirm Check-in"**
- Hệ thống gọi: `POST /api/bookings/101/check-in`
  ```json
  {
    "roomNumber": "101",
    "customerName": "Nguyễn Văn A",
    "actualCheckinTime": "2024-12-20T14:00:00"
  }
  ```
- Kết quả: ✅ Check-in thành công
- Booking Status: **CHECKED_IN**

---

## 🛎️ PHẦN 5: KHÁCH SỬ DỤNG DỊCH VỤ (Optional)

### Bước 16: Khách đăng nhập & request service
- **URL**: `http://localhost:5173/customer/request-service`
- Danh sách dịch vụ:
  - 🍽️ Room Service (Phục vụ phòng)
  - 🛏️ Extra Bed (Giường phụ)
  - 🚗 Airport Transfer (Di chuyển sân bay)
  - 🧖 Spa & Massage (Xoa bóp)
  - 🧹 Extra Cleaning (Dọn thêm)

### Bước 17: Request service
- Chọn: **"Room Service"**
- Nhập: Quantity: 2, Time: 3:00 PM
- Click **"Order Service"**
- Hệ thống tạo service request
- Staff sẽ nhận notification & fulfill

---

## 🚪 PHẦN 6: KHÁCH CHECK-OUT & THANH TOÁN

### Bước 18: Lễ tân quản lý Check-out
- **URL**: `http://localhost:5173/staff/check-out-management`
- Hệ thống gọi: `GET /api/bookings/check-out-list`
- Danh sách:
  ```
  Booking ID:  101
  Customer:    Nguyễn Văn A
  Room:        101 (Deluxe Room)
  Check-out:   Dec 25, 2024, 11:00 AM
  Status:      CHECKED_IN - Ready to Check-out
  ```

### Bước 19: Xem chi tiết invoice
- Click booking 101
- Hệ thống gọi: `GET /api/invoices/view/booking/101`
- Hiển thị:
  ```
  ========== INVOICE ==========
  Room Charge (5 nights):    $550
  Service Charges:           $100
  - Room Service: $50
  - Spa: $50
  
  Subtotal:                  $650
  Deposit Paid (30%):        -$165
  Remaining Amount:          $485
  
  Check-out Time:            11:30 AM (30 min late)
  Late Checkout Fee:         +$20
  
  TOTAL TO PAY:              $505
  ```

### Bước 20: Xác nhận check-out & thanh toán
- Chọn phương thức thanh toán:
  ```
  ☐ Stripe (Credit Card)
  ☑ Cash
  ☐ Bank Transfer
  ```
- Click **"Confirm Check-out"**
- Hệ thống gọi:
  1. `POST /api/bookings/101/calculate-checkout` → Tính tiền cuối
  2. `POST /api/bookings/101/check-out` → Xác nhận check-out
     ```json
     {
       "paymentMethod": "CASH",
       "actualCheckoutTime": "2024-12-25T11:30:00",
       "amount": 505
     }
     ```
- Kết quả: ✅ Check-out thành công
- Booking Status: **CHECKED_OUT**
- In hóa đơn

---

## 🧹 PHẦN 7: HOUSEKEEPER DỌN PHÒNG

### Bước 21: Housekeeper đăng nhập
- **URL**: `http://localhost:5173/staff/login`
- Thông tin:
  ```
  Email:    housekeeper@hotel.com
  Password: Housekeeper@123
  ```
- Chuyển sang: Dashboard hoặc Housekeeping Task list

### Bước 22: Xem danh sách dọn phòng
- **URL**: `http://localhost:5173/staff/housekeeping-task`
- Danh sách:
  ```
  Task ID:    HK-101
  Room:       101 (Deluxe Room)
  Status:     CHECKED_OUT - Pending Cleaning
  Priority:   Normal
  Assigned:   (Chưa assign)
  ```

### Bước 23: Assign task & dọn phòng
- Click task HK-101
- Assign cho Housekeeper (hoặc auto assign)
- Housekeeper click **"Start Cleaning"**
- Status: **CLEANING**
- Sau khi dọn xong, click **"Complete"**
- Hệ thống gọi: `POST /api/housekeeping/complete/{taskId}`
- Status: **COMPLETED**
- Room Status: **AVAILABLE**

---

## 📊 PHẦN 8: MANAGER DASHBOARD

### Bước 24: Manager đăng nhập & xem dashboard
- **URL**: `http://localhost:5173/staff/manager-dashboard`
- Hiển thị:
  ```
  📊 Dashboard Statistics:
  - Today's Bookings: 15
  - Checked-in: 10
  - Check-out Today: 8
  - Revenue Today: $5,500
  
  📅 Upcoming Check-ins:
  - Booking 102: Dec 26, 2:00 PM
  - Booking 103: Dec 26, 4:00 PM
  
  ✅ Pending Tasks:
  - 3 Check-out payments
  - 5 Housekeeping tasks
  ```

---

## 🔒 PHẦN 9: LOGOUT

### Bước 25: Đăng xuất
- Click menu → **"Logout"**
- Hệ thống gọi: `POST /api/auth/logout` (hoặc `/api/auth/staff/logout`)
- Xóa JWT token từ localStorage
- Chuyển hướng: Trang Login

---

## 📝 DATA TEST TÓMNHẤT

| Vai trò | Email | Password | Role |
|---------|-------|----------|------|
| Khách hàng | nguyenvana@gmail.com | Pass@123456 | CUSTOMER |
| Lễ tân | receptionist@hotel.com | Receptionist@123 | RECEPTIONIST |
| Housekeeper | housekeeper@hotel.com | Housekeeper@123 | HOUSEKEEPER |
| Manager | manager@hotel.com | Manager@123 | MANAGER |

---

## 🧪 TEST CARD STRIPE

```
Number:     4242 4242 4242 4242
Expiry:     12/25
CVC:        123
Name:       Any Name
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Backend phải chạy**: `java -jar backend.jar` (cổng 8080)
2. **Frontend phải chạy**: `npm run dev` (cổng 5173)
3. **Database phải có dữ liệu**:
   - Ít nhất 2 loại phòng (Room Type)
   - Ít nhất 5 phòng (Room)
   - Ít nhất 1 staff mỗi role
4. **JWT Token**: Lưu trong localStorage, ghi "Authorization: Bearer {token}" vào headers
5. **Timezone**: Sử dụng UTC hoặc timezone cụ thể (tùy backend config)
6. **Payment**: Nếu không test Stripe, có thể skip bước payment (dev mode)

---

## 📞 TROUBLESHOOTING

| Lỗi | Giải pháp |
|-----|----------|
| "Cannot connect to server" | Kiểm tra backend chạy ở 8080 |
| "Token expired" | Đăng nhập lại |
| "Booking not found" | Kiểm tra bookingId có tồn tại |
| "Room unavailable" | Chọn ngày/phòng khác |
| "Payment failed" | Dùng test card: 4242... |

---

## 🎯 KHI HOÀN TẤT DEMO

1. ✅ Khách đã hoàn tất check-out
2. ✅ Housekeeper đã dọn xong phòng
3. ✅ Manager xem được thống kê doanh thu
4. ✅ Tất cả dữ liệu được lưu trong database
5. ✅ Invoice/Report có thể export

**Demo thành công!** 🎉
