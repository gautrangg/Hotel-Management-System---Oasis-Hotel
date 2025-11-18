package backend.controller;

import backend.dto.schedule.*;
import backend.entity.ScheduleRequest;
import backend.service.ScheduleRequestService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
public class ScheduleRequestController {
    private final ScheduleRequestService scheduleRequestService;

    public ScheduleRequestController(ScheduleRequestService scheduleRequestService) {
        this.scheduleRequestService = scheduleRequestService;
    }

    // Manager side
    @GetMapping("/change-shift-requests")
    public List<ChangeShiftRequestDTO> getChangeShiftRequests() {
        return scheduleRequestService.getAllChangeShiftRequests();
    }

    @GetMapping("/leave-requests")
    public List<LeaveRequestDTO> getLeaveRequests() {
        return scheduleRequestService.getAllLeaveRequests();
    }


    // Staff side
    @GetMapping("/history-leave-requests")
    public List<LeaveRequestDTO> getMyLeaveRequests() {
        return scheduleRequestService.getLeaveRequestsStaffByEmail();
    }

    @GetMapping("/history-change-shift-requests")
    public List<ChangeShiftRequestDTO> getMyChangeShiftRequests() {
        return scheduleRequestService.getChangeShiftRequestsStaffByEmail();
    }

    // Lấy ca làm của 1 người theo date, email
    @GetMapping("/shift")
    public ShiftResponseDTO getShiftForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String email) {
        return scheduleRequestService.getShiftByDate(email, date);
    }

    // Lấy danh sách các nhân viên có ca làm cùng ngày, khác email, cùng role, khác ca làm
    @GetMapping("/staff-shift")
    public List<StaffScheduleDTO> getStaffByDate(
            @RequestParam("date") String date,
            @RequestParam("role") String role,
            @RequestParam("shift") String shiftName
    ) {
        String excludeEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        LocalDate localDate = LocalDate.parse(date);
        return scheduleRequestService.getStaffSchedulesByDate(localDate, excludeEmail,role, shiftName);
    }

    // Tạo 1 schedule request: Leave hoặc Change
    @PostMapping("/schedule-requests")
    public ResponseEntity<?> createScheduleRequest(@RequestBody ScheduleRequestDTO dto) {
        try {
            ScheduleRequest savedRequest = scheduleRequestService.createRequest(dto);
            return ResponseEntity.ok(savedRequest);
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Xóa schedule request
    @DeleteMapping("/delete-schedule-requests/{scheduleRequestId}")
    public ResponseEntity<?> deleteScheduleRequest (@PathVariable Long scheduleRequestId){
        try {
            scheduleRequestService.deleteScheduleRequest(scheduleRequestId);
            return ResponseEntity.ok("Delete successfully!");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Edit request when status = pending
    @PutMapping("/edit-schedule-requests/{requestId}")
    public ResponseEntity<?> updateScheduleRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> payload) {
        try {
            ScheduleRequest updatedRequest = scheduleRequestService.updateChangeShiftRequest(requestId, payload);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/edit-leave-requests/{requestId}")
    public ResponseEntity<?> updateLeaveRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> payload) {
        try {
            ScheduleRequest updatedRequest = scheduleRequestService.updateLeaveRequest(requestId, payload);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Approve or Rejected (Manager)
    @PutMapping("/update-requests/{requestId}/{action}")
    public ResponseEntity<?> processScheduleRequest(
            @PathVariable Long requestId,
            @PathVariable String action,
            @RequestBody Map<String, Object> payload) {

        try {
            scheduleRequestService.processScheduleRequest(requestId, action, payload);

            String successMessage = "Request has been " + action + " successfully.";
            return ResponseEntity.ok(Map.of("message", successMessage));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
