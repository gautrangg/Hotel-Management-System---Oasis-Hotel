package backend.dto.booking;

import java.time.LocalDateTime;

public class ActiveRoomBookingDTO {

    private Long roomId;
    private String roomNumber;
    private Integer floor;
    private String roomStatus;

    private Long bookingId;
    private LocalDateTime checkinDate;
    private LocalDateTime checkoutDate;
    private String bookingStatus;

    private Long bookingRoomId;
    private LocalDateTime actualCheckin;
    private LocalDateTime actualCheckout;

    public ActiveRoomBookingDTO(Long roomId, String roomNumber, Integer floor, String roomStatus,
                                Long bookingId, LocalDateTime checkinDate, LocalDateTime checkoutDate, String bookingStatus,
                                Long bookingRoomId, LocalDateTime actualCheckin, LocalDateTime actualCheckout) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.roomStatus = roomStatus;
        this.bookingId = bookingId;
        this.checkinDate = checkinDate;
        this.checkoutDate = checkoutDate;
        this.bookingStatus = bookingStatus;
        this.bookingRoomId = bookingRoomId;
        this.actualCheckin = actualCheckin;
        this.actualCheckout = actualCheckout;
    }

    public Long getRoomId() { return roomId; }
    public String getRoomNumber() { return roomNumber; }
    public Integer getFloor() { return floor; }
    public String getRoomStatus() { return roomStatus; }
    public Long getBookingId() { return bookingId; }
    public LocalDateTime getCheckinDate() { return checkinDate; }
    public LocalDateTime getCheckoutDate() { return checkoutDate; }
    public String getBookingStatus() { return bookingStatus; }
    public Long getBookingRoomId() { return bookingRoomId; }
    public LocalDateTime getActualCheckin() { return actualCheckin; }
    public LocalDateTime getActualCheckout() { return actualCheckout; }
}