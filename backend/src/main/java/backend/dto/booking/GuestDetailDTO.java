package backend.dto.booking;

public class GuestDetailDTO {
    private Integer guestDetailId;
    private String fullName;
    private String gender;
    private String citizenId;
    private String action;

    public GuestDetailDTO() {}

    public GuestDetailDTO(Integer guestDetailId, String fullName, String gender, String citizenId, String action) {
        this.guestDetailId = guestDetailId;
        this.fullName = fullName;
        this.gender = gender;
        this.citizenId = citizenId;
        this.action = action;
    }

    // Getters and Setters
    public Integer getGuestDetailId() {
        return guestDetailId;
    }

    public void setGuestDetailId(Integer guestDetailId) {
        this.guestDetailId = guestDetailId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}
