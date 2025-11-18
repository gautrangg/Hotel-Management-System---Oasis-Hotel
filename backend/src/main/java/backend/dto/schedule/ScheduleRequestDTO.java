package backend.dto.schedule;

public class ScheduleRequestDTO {
    private Long requesterStaffId;
    private Long scheduleId;
    private Long acceptingStaffId;
    private String requestType;
    private String reason;

    public Long getAcceptingStaffId() {
        return acceptingStaffId;
    }

    public void setAcceptingStaffId(Long acceptingStaffIdl) {
        this.acceptingStaffId = acceptingStaffIdl;
    }

    public Long getRequesterStaffId() {
        return requesterStaffId;
    }

    public void setRequesterStaffId(Long requesterStaffId) {
        this.requesterStaffId = requesterStaffId;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
