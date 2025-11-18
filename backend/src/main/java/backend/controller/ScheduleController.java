package backend.controller;

import backend.dto.schedule.ScheduleDetailDTO;
import backend.dto.schedule.ScheduleWeekDTO;
import backend.dto.schedule.UpdateAttendanceDTO;
import backend.entity.Schedule;
import backend.service.ScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/week")
    public ResponseEntity<List<ScheduleWeekDTO>> getSchedulesByWeek(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        List<ScheduleWeekDTO> list = scheduleService.getSchedulesByWeek(start, end);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(
            @RequestParam String start,
            @RequestParam String end
    ) {
        LocalDate s = LocalDate.parse(start);
        LocalDate e = LocalDate.parse(end);
        return scheduleService.getScheduleSummary(s, e);
    }

    @GetMapping("/detail")
    public ResponseEntity<List<ScheduleDetailDTO>> getScheduleDetail(
            @RequestParam("shiftId") Long shiftId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<ScheduleDetailDTO> list = scheduleService.getScheduleDetail(shiftId, date);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/create-week")
    public ResponseEntity<Map<String, Object>> createWeekSchedule(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        Map<String, Object> result = scheduleService.createWeekSchedule(start, end);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/attendance")
    public ResponseEntity<Map<String, Object>> updateAttendance(
            @RequestBody UpdateAttendanceDTO attendanceDTO) {

        Map<String, Object> result = scheduleService.updateAttendance(attendanceDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/available-staff")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getAvailableStaff(
            @RequestParam("shiftId") Long shiftId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        Map<String, List<Map<String, Object>>> list = scheduleService.getAvailableStaff(shiftId, date);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/add-staff")
    public ResponseEntity<Map<String, Object>> addStaffToShift(@RequestBody Map<String, Object> body) {
        Long shiftId = ((Number) body.get("shiftId")).longValue();
        LocalDate workDate = LocalDate.parse(body.get("workDate").toString());
        List<Long> staffIds = ((List<?>) body.get("staffIds"))
                .stream()
                .map(o -> ((Number) o).longValue())
                .collect(Collectors.toList());

        Map<String, Object> result = scheduleService.addStaffToShift(shiftId, workDate, staffIds);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancelSchedule(@RequestBody Map<String, Object> body) {
        Long scheduleId = ((Number) body.get("scheduleId")).longValue();
        Map<String, Object> result = scheduleService.updateAttendanceStatus(scheduleId, "Cancelled");
        return ResponseEntity.ok(result);
    }


    // List schedules
    @GetMapping("/{staffId}")
    public List<Schedule> getSchedulesByWeek(
            @PathVariable Long staffId,
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to")   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return scheduleService.getSchedulesForWeek(staffId, from, to);
    }
}

