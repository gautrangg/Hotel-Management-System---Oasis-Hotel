package backend.entity;


import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDate;

@Entity
@Table(name = "Schedules")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "shift_id")
    private Long shiftId;

    @ManyToOne
    @JoinColumn(name = "shift_id", insertable = false, updatable = false)
    private Shift shift;

    @ManyToOne
    @JoinColumn(name = "staff_id", insertable = false, updatable = false)
    private Staff staff;


    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    public Schedule() {
    }

    public Schedule(Long scheduleId, Long shiftId, Long staffId, LocalDate workDate, String status) {
        this.scheduleId = scheduleId;
        this.shiftId = shiftId;
        this.staffId = staffId;
        this.workDate = workDate;
        this.status = status;
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public Shift getShift() {
        return shift;
    }

    public void setShift(Shift shift) {
        this.shift = shift;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Long getShiftId() {
        return shiftId;
    }

    public void setShiftId(Long shiftId) {
        this.shiftId = shiftId;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
