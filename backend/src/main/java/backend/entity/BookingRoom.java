package backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "BookingRooms")
public class BookingRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_room_id")
    private Long bookingRoomId;

    @Column(name = "actual_checkin")
    private LocalDateTime actualCheckin;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "room_id")
    private Long roomId;
    @Column(name = "actual_checkout")
    private LocalDateTime actualCheckout;

    @Column(name = "status")
    private String status;

    public BookingRoom(Long bookingRoomId, LocalDateTime actualCheckin, Long bookingId, Long roomId, LocalDateTime actualCheckout, String status) {
        this.bookingRoomId = bookingRoomId;
        this.actualCheckin = actualCheckin;
        this.bookingId = bookingId;
        this.roomId = roomId;
        this.actualCheckout = actualCheckout;
        this.status = status;
    }
    public BookingRoom() {
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getBookingRoomId() {
        return bookingRoomId;
    }

    public void setBookingRoomId(Long bookingRoomId) {
        this.bookingRoomId = bookingRoomId;
    }

    public LocalDateTime getActualCheckout() {
        return actualCheckout;
    }

    public void setActualCheckout(LocalDateTime actualCheckout) {
        this.actualCheckout = actualCheckout;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getActualCheckin() {
        return actualCheckin;
    }

    public void setActualCheckin(LocalDateTime actualCheckin) {
        this.actualCheckin = actualCheckin;
    }

}
