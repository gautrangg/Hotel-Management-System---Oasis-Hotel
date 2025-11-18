package backend.service;

import backend.dto.room.AvailableRoomDTO;
import backend.dto.room.RoomDetailDTO;
import backend.dto.room.RoomScheduleDTO;
import backend.dto.booking.SummaryDTO;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional; // Import Optional
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private RoomTypeRepository roomTypeRepository;
    @Autowired
    private RoomImageRepository roomImageRepository;
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PriceAdjustmentService priceAdjustmentService;

    public SummaryDTO getSummaryOfRoom(BigDecimal basePrice, LocalDate checkin,LocalDate checkout) {
        BigDecimal adjustedTotalPrice = priceAdjustmentService.calculateTotalPrice(basePrice, checkin, checkout);
        BigDecimal totalAdjustment = priceAdjustmentService.calculateTotalAdjustment(basePrice, checkin, checkout);
        BigDecimal deposit = priceAdjustmentService.calculateDeposit(adjustedTotalPrice);

        long nights = ChronoUnit.DAYS.between(checkin, checkout);
        BigDecimal baseTotal = basePrice.multiply(new BigDecimal(nights));

        SummaryDTO summary = new SummaryDTO();
        summary.setRoom(baseTotal.toString());
        summary.setAddtionalFee(totalAdjustment.toString());
        summary.setTotal(adjustedTotalPrice.toString());
        summary.setDeposit(deposit.toString());
        return summary;
    }

    public List<AvailableRoomDTO> findAvailableRoomsByDateAndType(LocalDate checkinDate, LocalDate checkoutDate, Long roomTypeId) {
        LocalDateTime checkinDateTime = checkinDate.atStartOfDay();
        LocalDateTime checkoutDateTime = checkoutDate.atStartOfDay();
        if (roomTypeId != null) {
            return roomRepository.findAvailableRoomsByDateAndType(checkinDateTime, checkoutDateTime, roomTypeId);
        } else {
            return roomRepository.findAvailableRoomsByDate(checkinDateTime, checkoutDateTime);
        }
    }


    public List<AvailableRoomDTO> findAvailableRooms(Long roomTypeId) {
        final String AVAILABLE_STATUS = "Available";

        if (roomTypeId == null) {
            return roomRepository.findAvailableRoomsInfoByStatus(AVAILABLE_STATUS);
        } else {
            return roomRepository.findAvailableRoomsInfoByStatusAndRoomTypeId(AVAILABLE_STATUS, roomTypeId);
        }
    }

    public List<RoomDetailDTO> getAllRooms() {
        // Only return active rooms (isActive = true)
        return roomRepository.findByIsActive(true).stream()
                .map(this::convertToDetailDTO)
                .collect(Collectors.toList());
    }
    public RoomDetailDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return convertToDetailDTO(room);
    }
    public void createRoom(String roomNumber, Integer floor, String status, Long roomTypeId) {
        if (roomRepository.findByRoomNumber(roomNumber).isPresent()) {
            throw new RuntimeException("Room number '" + roomNumber + "' already exists.");
        }

        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new RuntimeException("RoomType not found"));
        Room room = new Room();
        room.setRoomNumber(roomNumber);
        room.setFloor(floor);
        room.setStatus(formatStatus(status)); // Format status trước khi lưu
        room.setRoomTypeId(roomType.getRoomTypeId());
        room.setActive(true); // Set isActive to true by default
        roomRepository.save(room);
    }

    /**
     * Format status: chữ đầu viết hoa, các chữ sau viết thường
     * Ví dụ: "CHECKED-IN" -> "Checked-in", "OCCUPIED" -> "Occupied"
     */
    private String formatStatus(String status) {
        if (status == null || status.isEmpty()) {
            return status;
        }
        // Chia thành các phần bằng dấu gạch ngang
        String[] parts = status.split("-");
        StringBuilder formatted = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                formatted.append("-");
            }
            String part = parts[i];
            if (!part.isEmpty()) {
                formatted.append(part.substring(0, 1).toUpperCase())
                        .append(part.substring(1).toLowerCase());
            }
        }
        return formatted.toString();
    }

    public void updateRoom(Long id, String roomNumber, Integer floor, String status, Long roomTypeId) {
        Room roomToUpdate = roomRepository.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));

        Optional<Room> existingRoomWithSameNumber = roomRepository.findByRoomNumber(roomNumber);
        if (existingRoomWithSameNumber.isPresent() && !existingRoomWithSameNumber.get().getRoomId().equals(id)) {
            throw new RuntimeException("Room number '" + roomNumber + "' is already used by another room.");
        }

        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new RuntimeException("RoomType not found"));

        // Cập nhật thông tin trên phòng đã lấy ra
        roomToUpdate.setRoomNumber(roomNumber);
        roomToUpdate.setFloor(floor);
        roomToUpdate.setStatus(formatStatus(status)); // Format status trước khi lưu
        roomToUpdate.setRoomTypeId(roomType.getRoomTypeId());
        roomRepository.save(roomToUpdate);
    }

    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        // Soft delete: set isActive to false instead of deleting from database
        room.setActive(false);
        roomRepository.save(room);
    }
    private RoomDetailDTO convertToDetailDTO(Room room) {
        RoomType roomType = roomTypeRepository.findById(room.getRoomTypeId()).orElse(new RoomType());
        RoomDetailDTO dto = new RoomDetailDTO();
        dto.setId(room.getRoomId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setFloor(room.getFloor());
        dto.setStatus(room.getStatus());
        dto.setType(roomType.getRoomTypeName());
        dto.setPrice(roomType.getPrice());
        dto.setDescription(roomType.getDescription());
        List<String> images = roomImageRepository.findByRoomTypeId(room.getRoomTypeId())
                .stream().map(RoomImage::getImage).collect(Collectors.toList());
        dto.setImages(images);
        return dto;
    }

    public List<Room> getActiveRoomsByRoomTypeId(Long roomTypeId) {
        return roomRepository.findByRoomTypeIdAndIsActiveTrue(roomTypeId);
    }

    public List<RoomScheduleDTO> getRoomSchedule(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new RuntimeException("Room not found with ID: " + roomId);
        }
        List<Booking> bookings = bookingRepository.findValidBookingsByRoomId(roomId);
        return bookings.stream()
                .map(b -> new RoomScheduleDTO(b.getBookingId(), b.getCheckinDate(), b.getCheckoutDate()))
                .collect(Collectors.toList());
    }

}