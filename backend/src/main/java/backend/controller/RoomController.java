package backend.controller;

import backend.dto.booking.SummaryDTO;
import backend.dto.room.AvailableRoomDTO;
import backend.dto.room.RoomScheduleDTO;
import backend.dto.room.RoomTypeSearchResultDTO;
import backend.entity.Room;
import backend.repository.RoomRepository;
import backend.service.RoomSearchService;
import backend.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import backend.dto.room.RoomDetailDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomSearchService roomSearchService;

    //API moi khi receptionist chon phong moi khi booking
    @GetMapping("/calculate")
    public ResponseEntity<SummaryDTO> calculatePrice(
            @RequestParam("basePrice") BigDecimal basePrice,
            @RequestParam("checkin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkin,
            @RequestParam("checkout") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkout) {

        if (checkout.isBefore(checkin) || checkout.isEqual(checkin)) {
            return ResponseEntity.badRequest().build();
        }
        SummaryDTO summary = roomService.getSummaryOfRoom(basePrice,checkin,checkout);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/search-available")
    public ResponseEntity<?> searchAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkinDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkoutDate,
            @RequestParam(required = false) Long roomTypeId
    ) {
        try {
            if (checkinDate.isAfter(checkoutDate) || checkinDate.isEqual(checkoutDate)) {
                return ResponseEntity.badRequest().body("Check-out date must be after check-in date.");
            }
            List<AvailableRoomDTO> availableRooms = roomService.findAvailableRoomsByDateAndType(checkinDate, checkoutDate, roomTypeId );

            return ResponseEntity.ok(availableRooms);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<RoomDetailDTO>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDetailDTO> getRoomById(@PathVariable Long id) {
        RoomDetailDTO room = roomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkinDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkoutDate
    ) {
        try {
            if (checkinDate.isAfter(checkoutDate) || checkinDate.isEqual(checkoutDate)) {
                return ResponseEntity.badRequest().body("Check-out date must be after check-in date");
            }

            List<Room> availableRooms = roomRepository.findAvailableRoomsInDateRange(checkinDate, checkoutDate);

            System.out.println("Check-in DateTime: " + checkinDate);
            System.out.println("Check-out DateTime: " + checkoutDate);
            System.out.println("Available rooms found: " + availableRooms.size());
            availableRooms.forEach(r -> System.out.println("  Room ID: " + r.getRoomId() + " - Number: " + r.getRoomNumber()));

            return ResponseEntity.ok(availableRooms);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createRoom(
            @RequestParam("room_number") String roomNumber,
            @RequestParam("floor") Integer floor,
            @RequestParam("status") String status,
            @RequestParam("room_type_id") Long roomTypeId) {
        try {
            roomService.createRoom(roomNumber, floor, status, roomTypeId);
            return ResponseEntity.ok("Room created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating room: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id,
                                        @RequestParam("room_number") String roomNumber,
                                        @RequestParam("floor") Integer floor,
                                        @RequestParam("status") String status,
                                        @RequestParam("room_type_id") Long roomTypeId) {
        try {
            roomService.updateRoom(id, roomNumber, floor, status, roomTypeId);
            return ResponseEntity.ok("Room updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating room: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        try {
            roomService.deleteRoom(id);
            return ResponseEntity.ok("Room deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting room: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<RoomTypeSearchResultDTO>> searchRooms(
            @RequestParam("checkin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkin,
            @RequestParam("checkout") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkout,
            @RequestParam(value = "keywords", required = false) List<String> keywords) {

        List<RoomTypeSearchResultDTO> results = roomSearchService.searchAvailableRoomTypes(checkin, checkout, keywords);
        //trả về http status thành công kèm results, same với ResponseEntity.status(200).body(results)
        return ResponseEntity.ok(results);
    }

    /**
     * Get All Rooms by Room type
     * @param roomTypeId Get room type id to search
     * @return response entity
     */
    @GetMapping("/by-type/{roomTypeId}")
    public ResponseEntity<List<Room>> getRoomsByRoomTypeId(@PathVariable Long roomTypeId) {
        List<Room> rooms = roomService.getActiveRoomsByRoomTypeId(roomTypeId);
        return ResponseEntity.ok(rooms);
    }

    /**
     * Get Room Schedule by Booking Check in, Check out date
     * @param id id of room to get schedule
     * @return response entity
     */
    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<RoomScheduleDTO>> getRoomSchedule(@PathVariable Long id) {
        try {
            List<RoomScheduleDTO> schedule = roomService.getRoomSchedule(id);
            return ResponseEntity.ok(schedule);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}