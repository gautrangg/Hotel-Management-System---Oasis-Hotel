package backend.controller;

import backend.dto.housekeeping.HousekeepingTaskDTO;
import backend.entity.HousekeepingTask;
import backend.service.HousekeepingTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/housekeeping")
public class HousekeepingTaskController {

    @Autowired
    private HousekeepingTaskService housekeepingTaskService;

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<Map<String, List<HousekeepingTaskDTO>>> getTasksByStaffId(@PathVariable Long staffId) {
        Map<String, List<HousekeepingTaskDTO>> tasks = housekeepingTaskService.getTasksForStaff(staffId);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<HousekeepingTaskDTO> updateTask(
            @PathVariable Long taskId,
            @RequestBody Map<String, Object> updates
    ) {
        HousekeepingTaskDTO updatedTaskDto = housekeepingTaskService.updateTask(taskId, updates);
        return ResponseEntity.ok(updatedTaskDto);
    }

    @PostMapping("/tasks/assign")
    public ResponseEntity<?> assignNewTask(@RequestBody HousekeepingTask request) {
        try {
            HousekeepingTask createdTask = housekeepingTaskService.assignTask(request);
            return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while assigning the task.");
        }
    }

    @GetMapping("/notes/booking-room/{bookingRoomId}")
    public ResponseEntity<String> getNotesByBookingRoomId(@PathVariable Long bookingRoomId) {
        String allNotes = housekeepingTaskService.getNotesForBookingRoom(bookingRoomId);
        return ResponseEntity.ok(allNotes);
    }

    @GetMapping("/tasks/booking-room/{bookingRoomId}")
    public ResponseEntity<HousekeepingTaskDTO> getActiveTask(@PathVariable Long bookingRoomId) {
        return housekeepingTaskService.getActiveTaskByBookingRoomId(bookingRoomId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}