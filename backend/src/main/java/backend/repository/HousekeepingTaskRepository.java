package backend.repository;

import backend.dto.housekeeping.HousekeepingTaskDTO;
import backend.entity.HousekeepingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HousekeepingTaskRepository extends JpaRepository<HousekeepingTask, Long> {
    @Query("SELECT new backend.dto.housekeeping.HousekeepingTaskDTO(" +
            "h.taskId, r.roomNumber, br.bookingId, h.assignTime, h.finishTime, h.status, h.note, " +
            "s.fullName) " +
            "FROM HousekeepingTask h " +
            "JOIN BookingRoom br ON h.bookingRoomId = br.bookingRoomId " +
            "JOIN Room r ON br.roomId = r.roomId " +
            "JOIN Staff s ON h.staffId = s.staffId " +
            "WHERE h.staffId = :staffId " +
            "ORDER BY h.assignTime DESC")
    List<HousekeepingTaskDTO> findTasksByStaffId(@Param("staffId") Long staffId);

    List<HousekeepingTask> findByBookingRoomIdAndStatusNot(Long bookingRoomId, String status);

    List<HousekeepingTask> findByBookingRoomId(Long bookingRoomId);

}
