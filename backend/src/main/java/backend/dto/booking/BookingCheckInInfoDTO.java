package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BookingCheckInInfoDTO {
    private Long bookingId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerCitizenId;
    private BigDecimal deposit;
    private LocalDate checkinDate;
    private LocalDate checkoutDate;
    private String roomTypeName;
    private String roomNumber;
    private Integer adult;
    private Integer children;
    private BigDecimal price;
    private BigDecimal totalPrice;
    private Long roomId;
    private Long roomTypeId;

    // Constructors
    public BookingCheckInInfoDTO() {}

    // Getters and Setters
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerCitizenId() { return customerCitizenId; }
    public void setCustomerCitizenId(String customerCitizenId) { this.customerCitizenId = customerCitizenId; }
    public BigDecimal getDeposit() { return deposit; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }
    public LocalDate getCheckinDate() { return checkinDate; }
    public void setCheckinDate(LocalDate checkinDate) { this.checkinDate = checkinDate; }
    public LocalDate getCheckoutDate() { return checkoutDate; }
    public void setCheckoutDate(LocalDate checkoutDate) { this.checkoutDate = checkoutDate; }
    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }
    public String getRoomNumber() { return roomNumber; } // <-- THÊM MỚI
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Integer getAdult() {
        return adult;
    }

    public void setAdult(Integer adult) {
        this.adult = adult;
    }

    public Integer getChildren() {
        return children;
    }

    public void setChildren(Integer children) {
        this.children = children;
    }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Long getRoomId() { return roomId; } // <-- THÊM MỚI
    public void setRoomId(Long roomId) { this.roomId = roomId; } // <-- THÊM MỚI
    public Long getRoomTypeId() { return roomTypeId; } // <-- THÊM MỚI
    public void setRoomTypeId(Long roomTypeId) { this.roomTypeId = roomTypeId; } // <-- THÊM MỚI
}