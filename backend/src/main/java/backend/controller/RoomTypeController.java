package backend.controller;

import backend.dto.room.RoomBookingScheduleDTO;
import backend.dto.room.RoomTypeDetailDTO;
import backend.entity.RoomType;
import backend.service.RoomTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/roomtypes")
public class RoomTypeController {

    @Autowired
    private RoomTypeService roomTypeService;

    @PostMapping
    public RoomType addRoomType(@RequestBody RoomType roomType) {
        return roomTypeService.addRoomType(roomType);
    }

    @GetMapping
    public List<RoomType> getAllRoomTypes() {
        return roomTypeService.getAllRoomTypes();
    }

    @GetMapping("/all/details")
    public ResponseEntity<List<RoomTypeDetailDTO>> getAllRoomTypeDetails() {
        List<RoomTypeDetailDTO> roomTypeDetails = roomTypeService.getAllRoomTypeDetails();
        return ResponseEntity.ok(roomTypeDetails);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomType> getRoomTypeById(@PathVariable Long id) {
        Optional<RoomType> roomType = roomTypeService.getRoomTypeById(id);
        return roomType.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}")
    public RoomType updateRoomType(@PathVariable Long id, @RequestBody RoomType roomType) {
        return roomTypeService.updateRoomType(id, roomType);
    }

    @DeleteMapping("/{id}")
    public String deleteRoomType(@PathVariable Long id) {
        roomTypeService.deleteRoomType(id);
        return "RoomType with id " + id + " deleted.";
    }

    @GetMapping("/top5")
    public ResponseEntity<List<RoomTypeDetailDTO>> getTop5RoomTypeDetails() {
        List<RoomTypeDetailDTO> roomTypeDetails = roomTypeService.getTop5RoomTypeDetails();
        return ResponseEntity.ok(roomTypeDetails);
    }

    @GetMapping("/{id}/schedules")
    public ResponseEntity<List<RoomBookingScheduleDTO>> getSchedulesForRoomType(@PathVariable("id") Long id) {
        try {
            List<RoomBookingScheduleDTO> schedules = roomTypeService.getSchedulesByRoomTypeId(id);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

