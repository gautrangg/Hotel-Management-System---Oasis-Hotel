package backend.dto.schedule;

import java.time.LocalDate;
import java.util.Map;


public class UpdateAttendanceDTO {

    private Long shiftId;
    private LocalDate workDate;
    private Map<Long, String> attendance; // Key: staffId, Value: status ("On time", "Late", "Absent")

    public UpdateAttendanceDTO() {
    }

    public UpdateAttendanceDTO(Long shiftId, LocalDate workDate, Map<Long, String> attendance) {
        this.shiftId = shiftId;
        this.workDate = workDate;
        this.attendance = attendance;
    }

    public Long getShiftId() {
        return shiftId;
    }

    public void setShiftId(Long shiftId) {
        this.shiftId = shiftId;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public Map<Long, String> getAttendance() {
        return attendance;
    }

    public void setAttendance(Map<Long, String> attendance) {
        this.attendance = attendance;
    }
}