package backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ShiftTypes")
public class ShiftType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_type_id")
    private Long shiftTypeId;

    @Column(name = "shift_type_name", nullable = false, unique = true, length = 100)
    private String shiftTypeName;

    public ShiftType() {
    }

    public ShiftType(Long shiftTypeId, String shiftTypeName) {
        this.shiftTypeId = shiftTypeId;
        this.shiftTypeName = shiftTypeName;
    }

    public Long getShiftTypeId() {
        return shiftTypeId;
    }

    public void setShiftTypeId(Long shiftTypeId) {
        this.shiftTypeId = shiftTypeId;
    }

    public String getShiftTypeName() {
        return shiftTypeName;
    }

    public void setShiftTypeName(String shiftTypeName) {
        this.shiftTypeName = shiftTypeName;
    }
}
