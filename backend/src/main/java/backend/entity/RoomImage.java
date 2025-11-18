package backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "RoomImages")
public class RoomImage implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_image_id")
    private Long roomImageId;

    @Column(name = "image")
    private String image;

    @Column(name = "room_type_id")
    private Long roomTypeId;

    public RoomImage() {
    }

    public RoomImage(Long roomImageId, String image, Long roomTypeId) {
        this.roomImageId = roomImageId;
        this.image = image;
        this.roomTypeId = roomTypeId;
    }

    public Long getRoomImageId() {
        return roomImageId;
    }

    public void setRoomImageId(Long roomImageId) {
        this.roomImageId = roomImageId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Long getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
    }
}
