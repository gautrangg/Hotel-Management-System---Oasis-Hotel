package backend.dto.schedule;

import java.time.LocalDate;
import java.time.LocalTime;

public class ScheduleWeekDTO {
    private Long scheduleId;
    private Long shiftId;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long staffId;
    private String staffName;
    private Long roleId;
    private String roleName;
    private LocalDate workDate;
    private String status;

    public ScheduleWeekDTO() {}

    public ScheduleWeekDTO(Long scheduleId, Long shiftId, String shiftName,
                           LocalTime startTime, LocalTime endTime,
                           Long staffId, String staffName,
                           Long roleId, String roleName,
                           LocalDate workDate, String status) {
        this.scheduleId = scheduleId;
        this.shiftId = shiftId;
        this.shiftName = shiftName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.staffId = staffId;
        this.staffName = staffName;
        this.roleId = roleId;
        this.roleName = roleName;
        this.workDate = workDate;
        this.status = status;
    }

    // Getters & Setters
    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }

    public Long getShiftId() { return shiftId; }
    public void setShiftId(Long shiftId) { this.shiftId = shiftId; }

    public String getShiftName() { return shiftName; }
    public void setShiftName(String shiftName) { this.shiftName = shiftName; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public LocalDate getWorkDate() { return workDate; }
    public void setWorkDate(LocalDate workDate) { this.workDate = workDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}