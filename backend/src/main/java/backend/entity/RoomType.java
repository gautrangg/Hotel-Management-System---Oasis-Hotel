package backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "RoomTypes")
public class RoomType implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_type_id")
    private Long roomTypeId;

    @Column(name = "room_type_name", nullable = false)
    private String roomTypeName;

    @Column(name = "adult")
    private Integer adult;

    @Column(name = "children")
    private Integer children;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;

    public RoomType() {
    }


    public RoomType(Long roomTypeId, String roomTypeName, Integer adult, Integer children, BigDecimal price, String description, Boolean isActive) {
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.adult = adult;
        this.children = children;
        this.price = price;
        this.description = description;
        this.isActive = isActive;
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
}
