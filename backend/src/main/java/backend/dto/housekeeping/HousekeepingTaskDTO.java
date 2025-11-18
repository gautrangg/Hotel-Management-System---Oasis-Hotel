package backend.dto.housekeeping;

import java.time.LocalDateTime;

public class HousekeepingTaskDTO {
    private Long taskId;
    private String roomNumber;
    private Long bookingId;
    private LocalDateTime assignTime;
    private LocalDateTime finishTime;
    private String status;
    private String note;
    private String staffName;

    public HousekeepingTaskDTO() {
    }

    public HousekeepingTaskDTO(Long taskId, String roomNumber, Long bookingId, LocalDateTime assignTime, LocalDateTime finishTime, String status, String note, String staffName) {
        this.taskId = taskId;
        this.roomNumber = roomNumber;
        this.bookingId = bookingId;
        this.assignTime = assignTime;
        this.finishTime = finishTime;
        this.status = status;
        this.note = note;
        this.staffName = staffName;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public LocalDateTime getAssignTime() {
        return assignTime;
    }

    public void setAssignTime(LocalDateTime assignTime) {
        this.assignTime = assignTime;
    }

    public LocalDateTime getFinishTime() {
        return finishTime;
    }

    public void setFinishTime(LocalDateTime finishTime) {
        this.finishTime = finishTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }
}
