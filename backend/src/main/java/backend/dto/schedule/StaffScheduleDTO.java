package backend.dto.schedule;


public class StaffScheduleDTO {
    private Long staffId;
    private String fullName;
    private String email;
    private String shiftName;

    public StaffScheduleDTO(Long staffId, String fullName, String email, String shiftName) {
        this.staffId = staffId;
        this.fullName = fullName;
        this.email = email;
        this.shiftName = shiftName;

    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getShiftName() {
        return shiftName;
    }

    public void setShiftName(String shiftName) {
        this.shiftName = shiftName;
    }

}

