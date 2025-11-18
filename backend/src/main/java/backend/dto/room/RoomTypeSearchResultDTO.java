package backend.dto.room;

import java.math.BigDecimal;
import java.util.List;

public class RoomTypeSearchResultDTO {
    private Long roomTypeId;
    private String roomTypeName;
    private BigDecimal price;
    private String description;
    private Integer adult;
    private Integer children;
    private List<String> images;
    private List<AvailableRoomDTO> availableRooms;

    public RoomTypeSearchResultDTO() {}

    public Long getRoomTypeId() { return roomTypeId; }
    public void setRoomTypeId(Long roomTypeId) { this.roomTypeId = roomTypeId; }
    public String getRoomTypeName() { return roomTypeName; }
    public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public List<AvailableRoomDTO> getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(List<AvailableRoomDTO> availableRooms) { this.availableRooms = availableRooms; }
}