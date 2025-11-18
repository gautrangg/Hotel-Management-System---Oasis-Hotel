package backend.dto.room;

import java.math.BigDecimal;

public class AvailableRoomDTO {
    private Long roomId;
    private String roomNumber;

    private String roomTypeName;
    private int capacity;
    private BigDecimal pricePerNight;

    public AvailableRoomDTO(Long roomId, String roomNumber) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
    }

    public AvailableRoomDTO(Long roomId, String roomNumber, String roomTypeName, Integer adult, Integer children, BigDecimal pricePerNight) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomTypeName = roomTypeName;
        this.capacity = (adult != null ? adult : 0) + (children != null ? children : 0);
        this.pricePerNight = pricePerNight;
    }


    // Getters and Setters


    public String getRoomTypeName() {
        return roomTypeName;
    }

    public void setRoomTypeName(String roomTypeName) {
        this.roomTypeName = roomTypeName;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
}