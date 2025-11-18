package backend.service;

import backend.dto.room.RoomBookingScheduleDTO;
import backend.dto.room.RoomTypeDetailDTO;
import backend.entity.Booking;
import backend.entity.Room;
import backend.entity.RoomImage;
import backend.entity.RoomType;
import backend.repository.BookingRepository;
import backend.repository.RoomImageRepository;
import backend.repository.RoomRepository;
import backend.repository.RoomTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomTypeService {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomImageRepository roomImageRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public RoomType addRoomType(RoomType roomType) {
        roomType.setActive(true); return roomTypeRepository.save(roomType);
    }

    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findByIsActive(true);
    }

    public Optional<RoomType> getRoomTypeById(Long id) {
        return roomTypeRepository.findById(id);
    }

    public RoomType updateRoomType(Long id, RoomType newData) {
        return roomTypeRepository.findById(id)
                .map(rt -> {
                    rt.setRoomTypeName(newData.getRoomTypeName());
                    rt.setAdult(newData.getAdult());
                    rt.setChildren(newData.getChildren());
                    rt.setPrice(newData.getPrice());
                    rt.setDescription(newData.getDescription());
                    return roomTypeRepository.save(rt);
                })
                .orElse(null);
    }

    public List<RoomTypeDetailDTO> getAllRoomTypeDetails() {
        List<RoomType> roomTypes = roomTypeRepository.findByIsActive(true);

        return roomTypes.stream().map(roomType -> {
            List<Room> rooms = Optional.ofNullable(
                    roomRepository.findByRoomTypeIdAndIsActiveTrue(roomType.getRoomTypeId())
            ).orElse(List.of());

            List<RoomImage> images = Optional.ofNullable(
                    roomImageRepository.findByRoomTypeId(roomType.getRoomTypeId())
            ).orElse(List.of());

            return new RoomTypeDetailDTO(roomType, images, rooms);
        }).collect(Collectors.toList());
    }

    public void deleteRoomType(Long id) {
        roomTypeRepository.deleteById(id);
    }

    public List<RoomTypeDetailDTO> getTop5RoomTypeDetails() {
        List<RoomType> roomTypes = roomTypeRepository.findByIsActive(true)
                .stream()
                .limit(5)
                .collect(Collectors.toList());

        return roomTypes.stream().map(roomType -> {
            List<Room> rooms = Optional.ofNullable(
                    roomRepository.findByRoomTypeIdAndIsActiveTrue(roomType.getRoomTypeId())
            ).orElse(List.of());
            List<RoomImage> images = Optional.ofNullable(
                    roomImageRepository.findByRoomTypeId(roomType.getRoomTypeId())
            ).orElse(List.of());
            return new RoomTypeDetailDTO(roomType, images, rooms);
        }).collect(Collectors.toList());
    }

    public List<RoomBookingScheduleDTO> getSchedulesByRoomTypeId(Long roomTypeId) {
        List<Room> rooms = roomRepository.findByRoomTypeIdAndIsActiveTrue(roomTypeId);
        if (rooms.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> roomIds = rooms.stream()
                .map(Room::getRoomId)
                .collect(Collectors.toList());

        return bookingRepository.findSchedulesByRoomIds(roomIds);
    }
}
