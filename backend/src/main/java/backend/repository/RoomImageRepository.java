package backend.repository;

import backend.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    List<RoomImage> findByRoomTypeId(Long roomTypeId);
    void deleteByRoomTypeId(Long roomTypeId);
}