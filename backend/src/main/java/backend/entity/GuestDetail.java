package backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "GuestDetails")
public class GuestDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "guest_detail_id", nullable = false)
    private Long guestDetailId;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "citizen_id", length = 20)
    private String citizenId;

    public GuestDetail() {
    }

    public GuestDetail(Long bookingId, String fullName, String gender, String citizenId) {
        this.bookingId = bookingId;
        this.fullName = fullName;
        this.gender = gender;
        this.citizenId = citizenId;
    }

    public Long getGuestDetailId() {
        return guestDetailId;
    }

    public void setGuestDetailId(Long guestDetailId) {
        this.guestDetailId = guestDetailId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
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

}

