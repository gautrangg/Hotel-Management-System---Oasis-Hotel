package backend.dto.room;

import backend.entity.Room;
import backend.entity.RoomImage;
import backend.entity.RoomType;

import java.math.BigDecimal;
import java.util.List;

public class RoomTypeDetailDTO {
    private Long roomTypeId;
    private String roomTypeName;
    private BigDecimal price;
    private Integer adult;
    private Integer children;
    private String description;
    private Boolean isActive;
    private List<RoomImage> images;
    private List<Room> rooms;

    public RoomTypeDetailDTO(RoomType roomType, List<RoomImage> images, List<Room> rooms) {
        this.roomTypeId = roomType.getRoomTypeId();
        this.roomTypeName = roomType.getRoomTypeName();
        this.price = roomType.getPrice();
        this.description = roomType.getDescription();
        this.isActive = roomType.getActive();
        this.images = images;
        this.rooms = rooms;
        this.adult = roomType.getAdult();
        this.children = roomType.getChildren();
    }

    public RoomTypeDetailDTO() {
    }

    public RoomTypeDetailDTO(Long roomTypeId, String roomTypeName, BigDecimal price, Integer adult, Integer children, String description, Boolean isActive, List<RoomImage> images, List<Room> rooms) {
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.price = price;
        this.adult = adult;
        this.children = children;
        this.description = description;
        this.isActive = isActive;
        this.images = images;
        this.rooms = rooms;
    }

    public Long getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getRoomTypeName() {
        return roomTypeName;
    }

    public void setRoomTypeName(String roomTypeName) {
        this.roomTypeName = roomTypeName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public List<RoomImage> getImages() {
        return images;
    }

    public void setImages(List<RoomImage> images) {
        this.images = images;
    }

    public List<Room> getRooms() {
        return rooms;
    }

    public void setRooms(List<Room> rooms) {
        this.rooms = rooms;
    }
}
