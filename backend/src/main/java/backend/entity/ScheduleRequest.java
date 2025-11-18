package backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "ScheduleRequests")
public class ScheduleRequest implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "requester_staff_id", nullable = false)
    private Long requesterStaffId;

    @Column(name = "accepting_staff_id")
    private Long acceptingStaffId;

    @Column(name = "approver_staff_id")
    private Long approverStaffId;

    @Column(name = "schedule_id")
    private Long scheduleId;

    @ManyToOne
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "accepting_staff_id", insertable = false, updatable = false)
    private Staff acceptingStaff;

    @Column(name = "request_type", length = 100)
    private String requestType;

    @Column(name = "reason", columnDefinition = "NVARCHAR(MAX)")
    private String reason;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "create_at")
    private LocalDateTime createAt;

    public ScheduleRequest() {
    }


    public ScheduleRequest(Long requestId, Long requesterStaffId, Long acceptingStaffId, Long approverStaffId, Long scheduleId, String requestType, String reason, String status, LocalDateTime createAt) {
        this.requestId = requestId;
        this.requesterStaffId = requesterStaffId;
        this.acceptingStaffId = acceptingStaffId;
        this.approverStaffId = approverStaffId;
        this.scheduleId = scheduleId;
        this.requestType = requestType;
        this.reason = reason;
        this.status = status;
        this.createAt = createAt;
    }

    public Staff getAcceptingStaff() {
        return acceptingStaff;
    }

    public void setAcceptingStaff(Staff acceptingStaff) {
        this.acceptingStaff = acceptingStaff;
    }

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getRequesterStaffId() {
        return requesterStaffId;
    }

    public void setRequesterStaffId(Long requesterStaffId) {
        this.requesterStaffId = requesterStaffId;
    }

    public Long getAcceptingStaffId() {
        return acceptingStaffId;
    }

    public void setAcceptingStaffId(Long acceptingStaffId) {
        this.acceptingStaffId = acceptingStaffId;
    }

    public Long getApproverStaffId() {
        return approverStaffId;
    }

    public void setApproverStaffId(Long approverStaffId) {
        this.approverStaffId = approverStaffId;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }
}
