package backend.dto.room;

import java.time.LocalDateTime;

public class RoomScheduleDTO {
    private Long bookingId;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;

    public RoomScheduleDTO(Long bookingId, LocalDateTime checkinDate, LocalDateTime checkoutDate) {
        this.bookingId = bookingId;
        this.checkinDate = checkinDate;
        this.checkoutDate = checkoutDate;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
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
}