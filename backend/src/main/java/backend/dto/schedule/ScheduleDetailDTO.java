// backend/dto/ScheduleDetailDTO.java
package backend.dto.schedule;

public class ScheduleDetailDTO {
    private Long scheduleId;
    private Long staffId;
    private String staffImage;
    private String fullName;
    private String email;
    private String phone;
    private String citizenId;
    private String roleName;
    private String status;

    public ScheduleDetailDTO(Long scheduleId, Long staffId, String staffImage, String fullName, String email, String phone,
                             String citizenId, String roleName, String status) {
        this.scheduleId = scheduleId;
        this.staffId = staffId;
        this.staffImage = staffImage;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.citizenId = citizenId;
        this.roleName = roleName;
        this.status = status;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStaffImage() {
        return staffImage;
    }

    public void setStaffImage(String staffImage) {
        this.staffImage = staffImage;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
