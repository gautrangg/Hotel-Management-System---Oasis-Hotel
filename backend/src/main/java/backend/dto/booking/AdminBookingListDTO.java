package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho danh sách booking trong trang quản lý admin
 */
public class AdminBookingListDTO {
    
    private Long bookingId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String roomNumber;
    private String roomTypeName;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;
    private String status;
    private BigDecimal deposit;
    private LocalDateTime createAt;
    private Integer numberOfGuests;
    
    public AdminBookingListDTO() {}
    
    public AdminBookingListDTO(Long bookingId, String customerName, String customerPhone, 
                              String customerEmail, String roomNumber, String roomTypeName,
                              LocalDateTime checkinDate, LocalDateTime checkoutDate, 
                              String status, BigDecimal deposit, LocalDateTime createAt,
                              Integer numberOfGuests) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerEmail = customerEmail;
        this.roomNumber = roomNumber;
        this.roomTypeName = roomTypeName;
        this.checkinDate = checkinDate;
        this.checkoutDate = checkoutDate;
        this.status = status;
        this.deposit = deposit;
        this.createAt = createAt;
        this.numberOfGuests = numberOfGuests;
    }
    
    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getCustomerPhone() {
        return customerPhone;
    }
    
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    
    public String getRoomNumber() {
        return roomNumber;
    }
    
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
    
    public String getRoomTypeName() {
        return roomTypeName;
    }
    
    public void setRoomTypeName(String roomTypeName) {
        this.roomTypeName = roomTypeName;
    }
    
    public LocalDateTime getCheckinDate() {
        return checkinDate;
    }
    
    public void setCheckinDate(LocalDateTime checkinDate) {
        this.checkinDate = checkinDate;
    }
    
    public LocalDateTime getCheckoutDate() {
        return checkoutDate;
    }
    
    public void setCheckoutDate(LocalDateTime checkoutDate) {
        this.checkoutDate = checkoutDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public BigDecimal getDeposit() {
        return deposit;
    }
    
    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }
    
    public LocalDateTime getCreateAt() {
        return createAt;
    }
    
    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }
    
    public Integer getNumberOfGuests() {
        return numberOfGuests;
    }
    
    public void setNumberOfGuests(Integer numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }
}
