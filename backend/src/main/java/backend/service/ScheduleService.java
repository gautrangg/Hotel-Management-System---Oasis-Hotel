package backend.service;

import backend.dto.schedule.ScheduleDetailDTO;
import backend.dto.schedule.ScheduleWeekDTO;
import backend.dto.schedule.UpdateAttendanceDTO;
import backend.entity.*;
import backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final StaffRepository staffRepository;
    private final RoleRepository roleRepository;
    private final ShiftRepository shiftRepository;
    private final ShiftTypeRepository shiftTypeRepository;

    public ScheduleService(ScheduleRepository scheduleRepository,
                           StaffRepository staffRepository,
                           RoleRepository roleRepository,
                           ShiftRepository shiftRepository,
                           ShiftTypeRepository shiftTypeRepository) {
        this.scheduleRepository = scheduleRepository;
        this.staffRepository = staffRepository;
        this.roleRepository = roleRepository;
        this.shiftRepository = shiftRepository;
        this.shiftTypeRepository = shiftTypeRepository;
    }

    public List<ScheduleWeekDTO> getSchedulesByWeek(LocalDate start, LocalDate end) {
        List<Object[]> rows = scheduleRepository.findSchedulesByWeek(start, end);

        return rows.stream().map(r -> new ScheduleWeekDTO(
                r[0] != null ? ((Number) r[0]).longValue() : null,
                r[1] != null ? ((Number) r[1]).longValue() : null,
                r[2] != null ? r[2].toString() : null,
                r[3] instanceof Time ? ((Time) r[3]).toLocalTime() :
                        (r[3] != null ? LocalTime.parse(r[3].toString()) : null),
                r[4] instanceof Time ? ((Time) r[4]).toLocalTime() :
                        (r[4] != null ? LocalTime.parse(r[4].toString()) : null),
                r[5] != null ? ((Number) r[5]).longValue() : null,
                r[6] != null ? r[6].toString() : null,
                r[7] != null ? ((Number) r[7]).longValue() : null,
                r[8] != null ? r[8].toString() : null,
                r[9] instanceof Date ? ((Date) r[9]).toLocalDate() :
                        (r[9] != null ? LocalDate.parse(r[9].toString()) : null),
                r[10] != null ? r[10].toString() : null
        )).collect(Collectors.toList());
    }

    public Map<String, Object> getScheduleSummary(LocalDate start, LocalDate end) {
        List<Schedule> schedules = scheduleRepository.findByWorkDateBetween(start, end);

        Map<Long, String> staffRoleMap = staffRepository.findAll().stream()
                .collect(Collectors.toMap(
                        Staff::getStaffId,
                        s -> roleRepository.findById(s.getRoleId().longValue())
                                .map(Role::getRoleName)
                                .orElse("Unknown")
                ));

        Map<String, Map<String, Long>> grouped = schedules.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getWorkDate() + "-" + s.getShiftId(),
                        Collectors.groupingBy(
                                s -> staffRoleMap.getOrDefault(s.getStaffId(), "Unknown"),
                                Collectors.counting()
                        )
                ));

        Map<String, Object> response = new HashMap<>();
        response.put("weekRange", start + " - " + end);
        response.put("data", grouped);
        return response;
    }

    public List<ScheduleDetailDTO> getScheduleDetail(Long shiftId, LocalDate workDate) {
        List<Object[]> rows = scheduleRepository.findByShiftAndDate(shiftId, workDate);
        return rows.stream().map(r -> new ScheduleDetailDTO(
                r[0] != null ? ((Number) r[0]).longValue() : null,
                r[1] != null ? ((Number) r[1]).longValue() : null,
                r[2] != null ? r[2].toString() : null,
                r[3] != null ? r[3].toString() : null,
                r[4] != null ? r[4].toString() : null,
                r[5] != null ? r[5].toString() : null,
                r[6] != null ? r[6].toString() : null,
                r[7] != null ? r[7].toString() : null,
                r[8] != null ? r[8].toString() : null
        )).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createWeekSchedule(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        int created = 0;
        int skipped = 0;

        List<String> scheduledRoles = Arrays.asList("Receptionist", "Housekeeper", "Service Staff");

        List<Staff> activeStaffs = staffRepository.findAll().stream()
                .filter(Staff::getActive)
                .filter(staff -> {
                    String roleName = roleRepository.findById(staff.getRoleId().longValue())
                            .map(Role::getRoleName)
                            .orElse("");
                    return scheduledRoles.contains(roleName);
                })
                .collect(Collectors.toList());

        List<Shift> shifts = shiftRepository.findAll();

        Map<Integer, String> shiftTypeMap = shiftTypeRepository.findAll().stream()
                .collect(Collectors.toMap(
                        st -> st.getShiftTypeId().intValue(),
                        ShiftType::getShiftTypeName
                ));

        List<Schedule> existingSchedules = scheduleRepository.findByWorkDateBetween(startDate, endDate);
        if (!existingSchedules.isEmpty()) {
            result.put("success", false);
            result.put("message", "Schedule already exists for this week");
            result.put("created", 0);
            return result;
        }

        List<Schedule> schedulesToSave = new ArrayList<>();

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            int dayOfWeek = currentDate.getDayOfWeek().getValue();

            for (Staff staff : activeStaffs) {
                if (staff.getDayOff() != null && staff.getDayOff() == dayOfWeek) {
                    skipped++;
                    continue;
                }

                String shiftTypeName = shiftTypeMap.get(staff.getShiftTypeId());
                List<Long> shiftIds = getShiftIdsForStaffType(shiftTypeName, shifts);

                for (Long shiftId : shiftIds) {
                    Schedule schedule = new Schedule();
                    schedule.setStaffId(staff.getStaffId());
                    schedule.setShiftId(shiftId);
                    schedule.setWorkDate(currentDate);
                    schedule.setStatus("Scheduled");
                    schedulesToSave.add(schedule);
                    created++;
                }
            }

            currentDate = currentDate.plusDays(1);
        }

        if (!schedulesToSave.isEmpty()) {
            scheduleRepository.saveAll(schedulesToSave);
        }

        result.put("success", true);
        result.put("message", "Week schedule created successfully");
        result.put("created", created);
        result.put("skipped", skipped);
        result.put("startDate", startDate);
        result.put("endDate", endDate);

        return result;
    }

    @Transactional
    public Map<String, Object> updateAttendanceStatus(Long scheduleId, String status) {
        Optional<Schedule> optional = scheduleRepository.findById(scheduleId);
        Map<String, Object> result = new HashMap<>();

        if (optional.isEmpty()) {
            result.put("success", false);
            result.put("message", "Schedule not found");
            return result;
        }

        Schedule schedule = optional.get();
        schedule.setStatus(status);
        scheduleRepository.save(schedule);

        result.put("success", true);
        result.put("message", "Attendance status updated successfully");
        result.put("scheduleId", scheduleId);
        result.put("newStatus", status);
        return result;
    }

    /**
     * Cập nhật trạng thái điểm danh cho nhiều nhân viên trong một ca cụ thể.
     *
     * @param attendanceDTO DTO chứa shiftId, workDate và map điểm danh.
     * @return Một map chứa kết quả của hoạt động.
     */
    @Transactional
    public Map<String, Object> updateAttendance(UpdateAttendanceDTO attendanceDTO) {
        Map<String, Object> response = new HashMap<>();

        Long shiftId = attendanceDTO.getShiftId();
        LocalDate workDate = attendanceDTO.getWorkDate();
        Map<Long, String> attendanceMap = attendanceDTO.getAttendance();

        if (shiftId == null || workDate == null || attendanceMap == null || attendanceMap.isEmpty()) {
            response.put("success", false);
            response.put("message", "Invalid input data.");
            return response;
        }

        List<Schedule> schedulesInShift = scheduleRepository.findByShiftIdAndWorkDate(shiftId, workDate);

        int updatedCount = 0;

        for (Schedule schedule : schedulesInShift) {
            Long currentStaffId = schedule.getStaffId();
            if (attendanceMap.containsKey(currentStaffId)) {
                String newStatus = attendanceMap.get(currentStaffId);
                schedule.setStatus(newStatus);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            scheduleRepository.saveAll(schedulesInShift);
        }

        response.put("success", true);
        response.put("message", "Attendance updated successfully for " + updatedCount + " staff members.");
        response.put("updatedCount", updatedCount);

        return response;
    }

    /**
     * Get available staffs for the shift schedule, grouped by roleName
     * @param shiftId
     * @param workDate
     * @return Map<String, List<Map<String,Object>>> grouped by roleName
     */
    public Map<String, List<Map<String, Object>>> getAvailableStaff(Long shiftId, LocalDate workDate) {
        List<Object[]> rows = scheduleRepository.findAvailableStaffForShift(shiftId, workDate);

        List<Map<String, Object>> staffList = rows.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("staffId", ((Number) r[0]).longValue());
            m.put("staffImage", r[1] != null ? r[1].toString() : null);
            m.put("fullName", r[2] != null ? r[2].toString() : null);
            m.put("email", r[3] != null ? r[3].toString() : null);
            m.put("phone", r[4] != null ? r[4].toString() : null);
            m.put("roleName", r[5] != null ? r[5].toString() : null);
            return m;
        }).collect(Collectors.toList());

        Map<String, List<Map<String, Object>>> grouped = staffList.stream()
                .collect(Collectors.groupingBy(s -> (String) s.get("roleName")));

        return grouped;
    }

    /**
     * Add available staffs to shift
     * @param shiftId
     * @param workDate
     * @param staffIds
     * @return result of insert operation
     */
    @Transactional
    public Map<String, Object> addStaffToShift(Long shiftId, LocalDate workDate, List<Long> staffIds) {
        Map<String, Object> result = new HashMap<>();

        if (shiftId == null || workDate == null || staffIds == null || staffIds.isEmpty()) {
            result.put("success", false);
            result.put("message", "Invalid input data");
            return result;
        }

        List<Schedule> toSave = new ArrayList<>();
        int reactivated = 0;
        int created = 0;

        for (Long staffId : staffIds) {
            Optional<Schedule> existingOpt = scheduleRepository.findByShiftIdAndWorkDateAndStaffId(shiftId, workDate, staffId);

            if (existingOpt.isPresent()) {
                Schedule existing = existingOpt.get();

                if ("Cancelled".equalsIgnoreCase(existing.getStatus())) {
                    existing.setStatus("Scheduled");
                    toSave.add(existing);
                    reactivated++;
                } else {
                    continue;
                }
            } else {
                // Nếu chưa có thì tạo mới
                Schedule newSchedule = new Schedule();
                newSchedule.setShiftId(shiftId);
                newSchedule.setStaffId(staffId);
                newSchedule.setWorkDate(workDate);
                newSchedule.setStatus("Scheduled");
                toSave.add(newSchedule);
                created++;
            }
        }

        if (!toSave.isEmpty()) {
            scheduleRepository.saveAll(toSave);
        }

        result.put("success", true);
        result.put("message", "Staffs added successfully");
        result.put("createdCount", created);
        result.put("reactivatedCount", reactivated);
        result.put("shiftId", shiftId);
        result.put("workDate", workDate);

        return result;

    }

    // Lấy lịch làm việc của 1 staff theo tuần
    public List<Schedule> getSchedulesForWeek(Long staffId, LocalDate from, LocalDate to) {
        return scheduleRepository.findByStaffIdAndWorkDateBetween(staffId, from, to);
    }

    /*======================= Private Utils ==========================*/

    private List<Long> getShiftIdsForStaffType(String shiftTypeName, List<Shift> shifts) {
        List<Long> shiftIds = new ArrayList<>();

        if (shiftTypeName == null) {
            return shiftIds;
        }

        switch (shiftTypeName) {
            case "Night":
                // Chỉ làm ca sáng
                shiftIds = shifts.stream()
                        .filter(s -> s.getShiftName().equals("Night"))
                        .map(Shift::getShiftId)
                        .collect(Collectors.toList());
                break;

            case "Morning":
                // Chỉ làm ca tối
                shiftIds = shifts.stream()
                        .filter(s -> s.getShiftName().equals("Morning"))
                        .map(Shift::getShiftId)
                        .collect(Collectors.toList());
                break;

            case "Evening":
                // Chỉ làm ca đêm
                shiftIds = shifts.stream()
                        .filter(s -> s.getShiftName().equals("Evening"))
                        .map(Shift::getShiftId)
                        .collect(Collectors.toList());
                break;

            default:
                break;
        }

        return shiftIds;
    }


}