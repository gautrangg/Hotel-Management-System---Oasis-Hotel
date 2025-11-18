package backend.dto.schedule;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ChangeShiftRequestDTO {
    private Long requestId;
    private Long scheduleId;
    private LocalDate shiftDate;
    private String requesterName;
    private String shift;
    private String targetShift;
    private String targetStaff;
    private Long targetStaffId;
    private String reason;
    private LocalDateTime requestAt;
    private String status;

    public ChangeShiftRequestDTO(Long requestId, Long scheduleId, LocalDate shiftDate, String requesterName, String shift, String targetShift, Long targetStaffId, String targetStaff,  String reason, LocalDateTime requestAt, String status) {
        this.requestId = requestId;
        this.scheduleId = scheduleId;
        this.shiftDate = shiftDate;
        this.requesterName = requesterName;
        this.shift = shift;
        this.targetShift = targetShift;
        this.targetStaff = targetStaff;
        this.targetStaffId = targetStaffId;
        this.reason = reason;
        this.requestAt = requestAt;
        this.status = status;
    }
    public ChangeShiftRequestDTO(Long requestId,  LocalDate shiftDate,  String shift, String targetShift,  String targetStaff,  String reason, LocalDateTime requestAt, String status) {
        this.requestId = requestId;
        this.scheduleId = scheduleId;
        this.shiftDate = shiftDate;
        this.requesterName = requesterName;
        this.shift = shift;
        this.targetShift = targetShift;
        this.targetStaff = targetStaff;
        this.targetStaffId = targetStaffId;
        this.reason = reason;
        this.requestAt = requestAt;
        this.status = status;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public LocalDate getShiftDate() {
        return shiftDate;
    }

    public void setShiftDate(LocalDate shiftDate) {
        this.shiftDate = shiftDate;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public String getTargetShift() {
        return targetShift;
    }

    public void setTargetShift(String targetShift) {
        this.targetShift = targetShift;
    }

    public String getTargetStaff() {
        return targetStaff;
    }

    public void setTargetStaff(String targetStaff) {
        this.targetStaff = targetStaff;
    }

    public Long getTargetStaffId() {
        return targetStaffId;
    }

    public void setTargetStaffId(Long targetStaffId) {
        this.targetStaffId = targetStaffId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getRequestAt() {
        return requestAt;
    }

    public void setRequestAt(LocalDateTime requestAt) {
        this.requestAt = requestAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
