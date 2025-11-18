package backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "HousekeepingTasks")
public class HousekeepingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "booking_room_id", nullable = false)
    private Long bookingRoomId;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "assign_time")
    private LocalDateTime assignTime = LocalDateTime.now();

    @Column(name = "finish_time")
    private LocalDateTime finishTime;

    @Column(name = "status", length = 50)
    private String status = "Assigned";

    @Column(name = "note")
    private String note;

    public HousekeepingTask() {
    }

    public HousekeepingTask(Long taskId, Long bookingRoomId, Long staffId, LocalDateTime assignTime, LocalDateTime finishTime, String status, String note) {
        this.taskId = taskId;
        this.bookingRoomId = bookingRoomId;
        this.staffId = staffId;
        this.assignTime = assignTime;
        this.finishTime = finishTime;
        this.status = status;
        this.note = note;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public Long getBookingRoomId() {
        return bookingRoomId;
    }

    public void setBookingRoomId(Long bookingRoomId) {
        this.bookingRoomId = bookingRoomId;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
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
}
