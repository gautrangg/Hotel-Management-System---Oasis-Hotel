package backend.dto.booking;

import java.time.LocalDateTime;

public class BookingCheckOutInfoDTO {
    private Long bookingId;
    private Long bookingRoomId;
    private String customerName;
    private String customerPhone;
    private String rooms;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getBookingRoomId() {
        return bookingRoomId;
    }

    public void setBookingRoomId(Long bookingRoomId) {
        this.bookingRoomId = bookingRoomId;
    }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getRooms() { return rooms; }
    public void setRooms(String rooms) { this.rooms = rooms; }

    public LocalDateTime getCheckinDate() {
        return checkinDate;
    }

    public void setCheckinDate(LocalDateTime checkinDate) {
        this.checkinDate = checkinDate;
    }

    public LocalDateTime getCheckoutDate() { return checkoutDate; }
    public void setCheckoutDate(LocalDateTime checkoutDate) { this.checkoutDate = checkoutDate; }
}