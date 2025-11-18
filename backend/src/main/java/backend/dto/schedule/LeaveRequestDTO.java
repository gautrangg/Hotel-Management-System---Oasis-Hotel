package backend.dto.schedule;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveRequestDTO {
    private Long requestId;
    private String requesterName;
    private LocalDate date;

    private Long scheduleId;
    private String shift;
    private String reason;
    private LocalDateTime requestAt;
    private String status;

    public LeaveRequestDTO(Long requestId, Long scheduleId, String requesterName, LocalDate date,  String shift, String reason, LocalDateTime requestAt, String status) {
        this.requestId = requestId;
        this.requesterName = requesterName;
        this.date = date;
        this.scheduleId = scheduleId;
        this.shift = shift;
        this.reason = reason;
        this.requestAt = requestAt;
        this.status = status;
    }

    public LeaveRequestDTO(Long requestId,  LocalDate date, String shift, String reason, LocalDateTime requestAt, String status) {
        this.requestId = requestId;
        this.date = date;
        this.scheduleId = scheduleId;
        this.shift = shift;
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

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
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
