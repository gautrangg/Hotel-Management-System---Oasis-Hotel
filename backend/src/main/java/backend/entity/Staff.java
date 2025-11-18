package backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "Staffs")
public class Staff implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "phone", unique = true)
    private String phone;

    @Column(name = "citizen_id", unique = true, length = 20)
    private String citizenId;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "address", columnDefinition = "NVARCHAR(MAX)")
    private String address;

    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Column(name = "shift_type_id", nullable = false)
    private Integer shiftTypeId;

    @Column(name = "staff_image", columnDefinition = "NVARCHAR(MAX)")
    private String staffImage;

    @Column(name = "charged_date")
    private LocalDate chargedDate = LocalDate.now();

    @Column(name = "day_off", nullable = false)
    private Integer dayOff;

    @Column(name = "isActive")
    private Boolean isActive = true;

    public Staff() {
    }

    public Staff(Long staffId, String fullName, String email, String password, String phone, String citizenId, String gender, LocalDate birthDate, String address, Integer roleId, Integer shiftTypeId, String staffImage, LocalDate chargedDate, Integer dayOff, Boolean isActive) {
        this.staffId = staffId;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.citizenId = citizenId;
        this.gender = gender;
        this.birthDate = birthDate;
        this.address = address;
        this.roleId = roleId;
        this.shiftTypeId = shiftTypeId;
        this.staffImage = staffImage;
        this.chargedDate = chargedDate;
        this.dayOff = dayOff;
        this.isActive = isActive;
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

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public Integer getShiftTypeId() {
        return shiftTypeId;
    }

    public void setShiftTypeId(Integer shiftTypeId) {
        this.shiftTypeId = shiftTypeId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String staffPassword) {
        this.password = staffPassword;
    }

    public String getPhone() {
        return phone;
    }

    public Integer getDayOff() {
        return dayOff;
    }

    public void setDayOff(Integer dayOff) {
        this.dayOff = dayOff;
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStaffImage() {
        return staffImage;
    }

    public void setStaffImage(String staffImage) {
        this.staffImage = staffImage;
    }

    public LocalDate getChargedDate() {
        return chargedDate;
    }

    public void setChargedDate(LocalDate chargedDate) {
        this.chargedDate = chargedDate;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }
}
