package backend.dto.room;

import java.math.BigDecimal;
import java.util.List;

public class RoomDetailDTO {

    private Long id;
    private String roomNumber;
    private Integer floor;
    private String status;
    private String type;
    private Integer nights;
    private BigDecimal total;
    private BigDecimal price;
    private String description;
    private Integer capacity;
    private List<String> images;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getNights() { return nights; }
    public void setNights(Integer nights) { this.nights = nights; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
