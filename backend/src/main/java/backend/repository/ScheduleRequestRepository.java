package backend.repository;

import backend.dto.schedule.ChangeShiftRequestDTO;
import backend.dto.schedule.LeaveRequestDTO;
import backend.entity.ScheduleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleRequestRepository extends JpaRepository<ScheduleRequest, Long> {

    // Manager side
    @Query("SELECT new backend.dto.schedule.LeaveRequestDTO(" +
            "sr.requestId, " +
            "s.scheduleId, " +
            "requester.fullName, " +
            "s.workDate, " +
            "sh.shiftName, " +
            "sr.reason, " +
            "sr.createAt, " +
            "sr.status) " +
            "FROM ScheduleRequest sr " +
            "JOIN sr.schedule s " +
            "JOIN s.staff requester " +
            "JOIN s.shift sh " +
            "WHERE sr.requestType = 'Leave' " +
            "ORDER BY sr.createAt DESC")
    List<LeaveRequestDTO> getAllLeaveRequests();

    @Query("SELECT new backend.dto.schedule.ChangeShiftRequestDTO(" +
            "sr.requestId, " +
            "originalSchedule.scheduleId, " +
            "originalSchedule.workDate, " +
            "requester.fullName, " +
            "originalShift.shiftName, " +
            "MAX(targetShiftEntity.shiftName), " +
            "targetStaff.staffId, " +
            "targetStaff.fullName, " +
            "sr.reason, " +
            "sr.createAt, " +
            "sr.status) " +
            "FROM ScheduleRequest sr " +
            "JOIN sr.schedule originalSchedule " +
            "JOIN originalSchedule.staff requester " +
            "JOIN originalSchedule.shift originalShift " +
            "LEFT JOIN sr.acceptingStaff targetStaff " +
            "LEFT JOIN Schedule targetSchedule ON targetSchedule.staff = targetStaff AND targetSchedule.workDate = originalSchedule.workDate " +
            "LEFT JOIN targetSchedule.shift targetShiftEntity " +
            "WHERE sr.requestType = 'Change' " +
            "GROUP BY sr.requestId, originalSchedule.scheduleId, originalSchedule.workDate, requester.fullName, originalShift.shiftName, targetStaff.staffId, targetStaff.fullName, sr.reason, sr.createAt, sr.status " +
            "ORDER BY sr.createAt DESC")
    List<ChangeShiftRequestDTO> getAllChangeShiftRequests();

    // Staff side
    @Query("SELECT new backend.dto.schedule.LeaveRequestDTO(" +
            "sr.requestId, " +
            "s.scheduleId, " +
            "requester.fullName, " +
            "s.workDate, " +
            "sh.shiftName, " +
            "sr.reason, " +
            "sr.createAt, " +
            "sr.status) " +
            "FROM ScheduleRequest sr " +
            "JOIN sr.schedule s " +
            "JOIN s.shift sh " +
            "JOIN s.staff requester " +
            "WHERE sr.requestType = 'Leave' AND requester.email = :email " +
            "ORDER BY sr.createAt DESC")
    List<LeaveRequestDTO> getLeaveRequestsByEmail(@Param("email") String email);

    @Query("SELECT new backend.dto.schedule.ChangeShiftRequestDTO(" +
            "sr.requestId, " +
            "s.scheduleId, " +
            "s.workDate, " +
            "s.staff.fullName, " +
            "s.shift.shiftName, " +
            "s2.shift.shiftName, " +
            "a.staffId, " +
            "a.fullName, " +
            "sr.reason, " +
            "sr.createAt, " +
            "sr.status) " +
            "FROM ScheduleRequest sr " +
            "JOIN sr.schedule s " +
            "LEFT JOIN sr.acceptingStaff a " +
            "LEFT JOIN Schedule s2 ON s2.staff = a AND s2.workDate = s.workDate " +
            "WHERE sr.requestType = 'Change' " +
            "AND s.staff.email = :email " +
            "ORDER BY sr.createAt DESC")
    List<ChangeShiftRequestDTO> getChangeShiftRequestsByEmail(@Param("email") String email);
}
