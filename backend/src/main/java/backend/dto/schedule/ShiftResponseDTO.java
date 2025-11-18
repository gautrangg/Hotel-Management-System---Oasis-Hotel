package backend.dto.schedule;

import java.time.LocalTime;

public class ShiftResponseDTO {
    private Long scheduleId;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;

    public ShiftResponseDTO(Long scheduleId, String shiftName, LocalTime startTime, LocalTime endTime) {
        this.scheduleId = scheduleId;
        this.shiftName = shiftName;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getShiftName() {
        return shiftName;
    }

    public void setShiftName(String shiftName) {
        this.shiftName = shiftName;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}