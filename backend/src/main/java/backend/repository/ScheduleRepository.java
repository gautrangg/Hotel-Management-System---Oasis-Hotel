package backend.repository;

import backend.dto.schedule.StaffScheduleDTO;
import backend.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByStaffIdAndWorkDateBetween(
            Long staffId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Lấy ca làm của 1 người theo date, email
    @Query("SELECT s FROM Schedule s " +
            "WHERE s.staff.email = :email " +
            "AND s.workDate = :workDate " +
            "AND s.status <> 'Cancelled'")
    Optional<Schedule> findByStaffEmailAndWorkDate(@Param("email") String email,
                                                   @Param("workDate") LocalDate workDate);

    // Lấy danh sách các nhân viên có ca làm cùng ngày, khác email, cùng role, khác ca làm
    @Query("""
    SELECT DISTINCT new backend.dto.schedule.StaffScheduleDTO(
        st.staffId, st.fullName, st.email, sh.shiftName
    )
    FROM Schedule s
    JOIN Staff st ON s.staffId = st.staffId
    JOIN Shift sh ON s.shiftId = sh.shiftId
    JOIN Role r ON st.roleId = r.roleId
    WHERE s.workDate = :date
      AND st.email <> :excludeEmail
      AND r.roleName = :role
      AND sh.shiftName <> :shift
""")
    List<StaffScheduleDTO> findStaffSchedulesByDateExcludingEmail(
            @Param("date") java.time.LocalDate date,
            @Param("excludeEmail") String excludeEmail,
            @Param("role") String role,
            @Param("shift") String shift
    );

    @Query(value =
            "SELECT s.schedule_id, s.shift_id, sh.shift_name, sh.start_time, sh.end_time, " +
                    "s.staff_id, st.full_name, st.role_id, r.role_name, s.work_date, s.status " +
                    "FROM Schedules s " +
                    "LEFT JOIN Shifts sh ON s.shift_id = sh.shift_id " +
                    "LEFT JOIN Staffs st ON s.staff_id = st.staff_id " +
                    "LEFT JOIN Roles r ON st.role_id = r.role_id " +
                    "WHERE s.work_date BETWEEN :startDate AND :endDate " +
                    "AND s.status <> 'Cancelled' " +
                    "ORDER BY sh.shift_id, s.work_date, st.full_name",
            nativeQuery = true)
    List<Object[]> findSchedulesByWeek(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    List<Schedule> findByWorkDateBetween(LocalDate start, LocalDate end);

    @Query(value =
            "SELECT s.schedule_id, st.staff_id, st.staff_image, st.full_name, st.email, st.phone, st.citizen_id, r.role_name, s.status " +
                    "FROM Schedules s " +
                    "JOIN Staffs st ON s.staff_id = st.staff_id " +
                    "JOIN Roles r ON st.role_id = r.role_id " +
                    "WHERE s.shift_id = :shiftId AND s.work_date = :workDate " +
                    "AND s.status <> 'Cancelled' " +
                    "ORDER BY st.full_name",
            nativeQuery = true)
    List<Object[]> findByShiftAndDate(@Param("shiftId") Long shiftId,
                                      @Param("workDate") LocalDate workDate);


    /**
     * Tìm tất cả các lịch trình cho một ca và ngày làm việc cụ thể.
     * @param shiftId ID của ca làm việc
     * @param workDate Ngày làm việc
     * @return Danh sách các lịch trình
     */
    List<Schedule> findByShiftIdAndWorkDate(Long shiftId, LocalDate workDate);

    @Query(value = """
        SELECT st.staff_id, st.staff_image, st.full_name, st.email, st.phone, r.role_name
        FROM Staffs st
        JOIN Roles r ON st.role_id = r.role_id
        WHERE st.isActive = 1
          AND r.role_name IN ('Receptionist', 'Housekeeper', 'Service Staff')
          AND st.staff_id NOT IN (
              SELECT s.staff_id
              FROM Schedules s
              WHERE s.shift_id = :shiftId
                AND s.work_date = :workDate
                AND (s.status IS NULL OR s.status <> 'Cancelled')
          )
        ORDER BY r.role_name, st.full_name
        """, nativeQuery = true)
    List<Object[]> findAvailableStaffForShift(@Param("shiftId") Long shiftId,
                                              @Param("workDate") LocalDate workDate);

    Optional<Schedule> findByShiftIdAndWorkDateAndStaffId(Long shiftId, LocalDate workDate, Long staffId);

    Optional<Schedule> findByStaffIdAndWorkDate(Long staffId, LocalDate workDate);


}
