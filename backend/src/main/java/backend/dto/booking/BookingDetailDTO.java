package backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingDetailDTO {
    private Long bookingId;
    private String roomNumber;
    private String roomTypeName;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;
    private Integer adult;
    private Integer children;
    private BigDecimal totalPrice;
    private BigDecimal deposit;
    private BigDecimal roomTypeBasePrice;
    private String status;
    private LocalDateTime createAt;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private String roomTypeImageUrl;

    public BookingDetailDTO() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }

    public LocalDateTime getCheckinDate() { return checkinDate; }
    public void setCheckinDate(LocalDateTime checkinDate) { this.checkinDate = checkinDate; }

    public LocalDateTime getCheckoutDate() { return checkoutDate; }
    public void setCheckoutDate(LocalDateTime checkoutDate) { this.checkoutDate = checkoutDate; }

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

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public BigDecimal getDeposit() { return deposit; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }

    public BigDecimal getRoomTypeBasePrice() {
        return roomTypeBasePrice;
    }

    public void setRoomTypeBasePrice(BigDecimal roomTypeBasePrice) {
        this.roomTypeBasePrice = roomTypeBasePrice;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreateAt() { return createAt; }
    public void setCreateAt(LocalDateTime createAt) { this.createAt = createAt; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getRoomTypeImageUrl() {
        return roomTypeImageUrl;
    }

    public void setRoomTypeImageUrl(String roomTypeImageUrl) {
        this.roomTypeImageUrl = roomTypeImageUrl;
    }
}