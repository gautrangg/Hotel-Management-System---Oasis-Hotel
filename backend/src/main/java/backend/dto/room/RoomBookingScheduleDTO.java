package backend.dto.room;

import java.time.LocalDateTime;

public class RoomBookingScheduleDTO {
    private Long roomId;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;

    public RoomBookingScheduleDTO(Long roomId, LocalDateTime checkinDate, LocalDateTime checkoutDate) {
        this.roomId = roomId;
        this.checkinDate = checkinDate;
        this.checkoutDate = checkoutDate;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
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
