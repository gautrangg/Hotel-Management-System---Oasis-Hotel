package backend.service;

import backend.dto.room.AvailableRoomDTO;
import backend.dto.room.RoomTypeSearchResultDTO;
import backend.entity.Room;
import backend.entity.RoomType;
import backend.repository.RoomImageRepository;
import backend.repository.RoomRepository;
import backend.repository.RoomTypeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomSearchService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomImageRepository roomImageRepository;

    // Sử dụng constructor injection
    public RoomSearchService(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository, RoomImageRepository roomImageRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomImageRepository = roomImageRepository;
    }

    /**
     * SỬA LẠI HOÀN TOÀN LOGIC TÌM KIẾM
     * Logic mới:
     * 1. Lấy tất cả các loại phòng đang hoạt động.
     * 2. Lọc chúng theo keywords (nếu có).
     * 3. Với mỗi loại phòng đã lọc, gọi vào repository để tìm các phòng cụ thể còn trống trong khoảng thời gian yêu cầu.
     * 4. Xây dựng DTO trả về nếu có phòng trống.
     */
    public List<RoomTypeSearchResultDTO> searchAvailableRoomTypes(LocalDate checkinDate, LocalDate checkoutDate, List<String> keywords) {

        // Chuyển đổi sang LocalDateTime với giờ check-in/check-out tiêu chuẩn
        LocalDateTime checkinDateTime = checkinDate.atTime(14, 0);
        LocalDateTime checkoutDateTime = checkoutDate.atTime(12, 0);

        List<RoomType> allActiveRoomTypes = roomTypeRepository.findByIsActive(true);

        // 2. Lọc theo keywords nếu có
        List<RoomType> filteredRoomTypes = (keywords == null || keywords.isEmpty())
                ? allActiveRoomTypes
                : allActiveRoomTypes.stream()
                .filter(rt -> keywords.stream()
                        .anyMatch(keyword -> rt.getRoomTypeName().toLowerCase().contains(keyword.toLowerCase()) ||
                                (rt.getDescription() != null && rt.getDescription().toLowerCase().contains(keyword.toLowerCase()))))
                .toList();

        return filteredRoomTypes.stream()
                .map(roomType -> {
                    List<Room> availableRooms = roomRepository.findAvailableRoomsByRoomTypeAndDateRange(
                            roomType.getRoomTypeId(),
                            checkinDateTime,
                            checkoutDateTime
                    );

                    if (availableRooms.isEmpty()) {
                        return null;
                    }

                    RoomTypeSearchResultDTO dto = new RoomTypeSearchResultDTO();
                    dto.setRoomTypeId(roomType.getRoomTypeId());
                    dto.setRoomTypeName(roomType.getRoomTypeName());
                    dto.setPrice(roomType.getPrice());
                    dto.setDescription(roomType.getDescription());
                    dto.setAdult(roomType.getAdult());
                    dto.setChildren(roomType.getChildren());

                    List<String> images = roomImageRepository.findByRoomTypeId(roomType.getRoomTypeId())
                            .stream()
                            .map(img -> "/upload/rooms/" + img.getImage())
                            .toList();
                    dto.setImages(images);

                    List<AvailableRoomDTO> availableRoomDTOs = availableRooms.stream()
                            .map(r -> new AvailableRoomDTO(r.getRoomId(), r.getRoomNumber()))
                            .toList();
                    dto.setAvailableRooms(availableRoomDTOs);

                    return dto;
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }
}