package backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "Rooms")
public class Room implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "room_type_id")
    private Long roomTypeId;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(name = "floor")
    private Integer floor;

    @Column(name = "status")
    private String status;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public Room() {
    }

    public Room(Long roomId, Long roomTypeId, String roomNumber, Integer floor, String status, Boolean isActive) {
        this.roomId = roomId;
        this.roomTypeId = roomTypeId;
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.status = status;
        this.isActive = isActive;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }
}