package backend.repository;

import backend.entity.ShiftType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShiftTypeRepository  extends JpaRepository<ShiftType, Long> {
    Optional<ShiftType> findByShiftTypeName(String shiftTypeName);
    boolean existsByShiftTypeName(String shiftTypeName);
}
