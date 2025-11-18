package backend.repository;

import backend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface StaffRepository  extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmailAndPasswordAndIsActive(String email, String password, boolean isActive);
    Optional<Staff> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByCitizenId(String citizenId);

    @Query(value = "SELECT s.* FROM Staffs s " +
            "JOIN Roles r ON s.role_id = r.role_id " +
            "JOIN Schedules sch ON s.staff_id = sch.staff_id " +
            "JOIN Shifts sh ON sch.shift_id = sh.shift_id " +
            "WHERE r.role_name = :roleName " +
            "AND sch.work_date = :currentDate " +
            "AND (" +
            "    (sh.start_time <= sh.end_time AND CAST(:currentTime AS TIME) BETWEEN sh.start_time AND sh.end_time) " +
            "    OR " +
            "    (sh.start_time > sh.end_time AND (CAST(:currentTime AS TIME) >= sh.start_time OR CAST(:currentTime AS TIME) <= sh.end_time))" +
            ")",
            nativeQuery = true)
    List<Staff> findStaffByRoleAndCurrentShift(
            @Param("roleName") String roleName,
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime
    );
    Integer countByIsActive(boolean isActive);
}
