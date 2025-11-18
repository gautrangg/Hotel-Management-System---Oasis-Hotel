package backend.service;

import backend.dto.schedule.*;
import backend.entity.Schedule;
import backend.entity.ScheduleRequest;
import backend.entity.Staff;
import backend.repository.ScheduleRepository;
import backend.repository.ScheduleRequestRepository;
import backend.repository.StaffRepository;
import backend.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
public class ScheduleRequestService {
    private final ScheduleRequestRepository scheduleRequestRepository;
    private final StaffRepository staffRepository;
    private final ScheduleRepository scheduleRepository;

    public ScheduleRequestService(ScheduleRequestRepository repo, StaffRepository staffRepository, ScheduleRepository scheduleRepository) {
        this.scheduleRequestRepository = repo;
        this.staffRepository = staffRepository;
        this.scheduleRepository = scheduleRepository;
    }

    // Manager side
    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return scheduleRequestRepository.getAllLeaveRequests();
    }

    public List<ChangeShiftRequestDTO> getAllChangeShiftRequests() {
        return scheduleRequestRepository.getAllChangeShiftRequests();
    }

    // Staff side
    public List<LeaveRequestDTO> getLeaveRequestsStaffByEmail() {
        String email = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return scheduleRequestRepository.getLeaveRequestsByEmail(email);
    }

    public List<ChangeShiftRequestDTO> getChangeShiftRequestsStaffByEmail() {
        String email = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return scheduleRequestRepository.getChangeShiftRequestsByEmail(email);
    }

    // Lấy ca làm của 1 người theo date, email
    public ShiftResponseDTO getShiftByDate(String email, LocalDate date) {
        return scheduleRepository.findByStaffEmailAndWorkDate(email, date)
                .map(s -> new ShiftResponseDTO(
                        s.getScheduleId(),
                        s.getShift().getShiftName(),
                        s.getShift().getStartTime(),
                        s.getShift().getEndTime()))
                .orElse(new ShiftResponseDTO(null, "Nothing", null, null));
    }

    // Lấy danh sách các nhân viên có ca làm cùng ngày, khác email, cùng role, khác ca làm
    public List<StaffScheduleDTO> getStaffSchedulesByDate(LocalDate date, String currentUserEmail, String role, String shiftName) {
        return scheduleRepository.findStaffSchedulesByDateExcludingEmail(date, currentUserEmail,role,shiftName);
    }

    // Tạo 1 schedule request: Leave hoặc Change
    public ScheduleRequest createRequest(ScheduleRequestDTO dto) {
        ScheduleRequest request = new ScheduleRequest();
        request.setRequesterStaffId(dto.getRequesterStaffId());
        request.setScheduleId(dto.getScheduleId());
        request.setAcceptingStaffId(dto.getAcceptingStaffId());
        request.setRequestType(dto.getRequestType());
        request.setReason(dto.getReason());
        request.setStatus("Pending");
        request.setCreateAt(LocalDateTime.now());
        return scheduleRequestRepository.save(request);
    }

    // Xóa request
    public void deleteScheduleRequest (Long id){
        scheduleRequestRepository.deleteById(id);
    }

    // Edit request when status = pending
    public ScheduleRequest updateChangeShiftRequest(Long requestId, Map<String, Object> payload) {
        Object targetStaffIdObj = payload.get("targetStaffId");
        Object scheduleIdObj = payload.get("scheduleId");

        if (targetStaffIdObj == null || scheduleIdObj == null) {
            throw new IllegalArgumentException("targetStaffId và scheduleId là bắt buộc.");
        }

        Long targetStaffId = ((Number) targetStaffIdObj).longValue();
        Long scheduleId = ((Number) scheduleIdObj).longValue();
        String reason = (String) payload.get("reason");

        ScheduleRequest requestToUpdate = scheduleRequestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Schedule request not found with id: " + requestId));

        Staff newAcceptingStaff = staffRepository.findById(targetStaffId)
                .orElseThrow(() -> new NoSuchElementException("Target staff not found with id: " + targetStaffId));

        Schedule newSchedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NoSuchElementException("Schedule not found with id: " + scheduleId));

        requestToUpdate.setAcceptingStaffId(newAcceptingStaff.getStaffId());
        requestToUpdate.setScheduleId(newSchedule.getScheduleId());
        requestToUpdate.setReason(reason);

        return scheduleRequestRepository.save(requestToUpdate);
    }


    public ScheduleRequest updateLeaveRequest(Long requestId, Map<String, Object> payload) {
        Long scheduleId = ((Number) payload.get("scheduleId")).longValue();
        String reason = (String) payload.get("reason");

        ScheduleRequest requestToUpdate = scheduleRequestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Schedule request not found with id: " + requestId));

        Schedule newSchedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NoSuchElementException("Schedule not found with id: " + scheduleId));

        requestToUpdate.setScheduleId(newSchedule.getScheduleId());
        requestToUpdate.setReason(reason);
        requestToUpdate.setAcceptingStaffId(null);

        // 5. Lưu và trả về
        return scheduleRequestRepository.save(requestToUpdate);
    }

    // Approve or Rejected (Manager)
    @Transactional
    public void processScheduleRequest(Long requestId, String action, Map<String, Object> payload) {
        // Lấy id người duyệt (Manager id)
        Object idObj = payload.get("approverStaffId");
        if (idObj == null) {
            throw new IllegalArgumentException("The Approver ID is required.");
        }
        Long approverStaffId = ((Number) idObj).longValue();

        // Chuyển action để lưu vào DB
        String newStatus;
        if ("approved".equalsIgnoreCase(action)) {
            newStatus = "Approved";
        } else if ("rejected".equalsIgnoreCase(action)) {
            newStatus = "Rejected";
        } else {
            throw new IllegalArgumentException("Invalid action: " + action + ". Only 'approved' or 'rejected' is accepted.");
        }

        // Tìm yêu cầu gốc
        ScheduleRequest request = scheduleRequestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Request with id not found: " + requestId));

        // Check lại xem được xử lý chưa
        if (!"Pending".equals(request.getStatus())) {
            throw new IllegalArgumentException("This request has been processed previously.");
        }

        // Cập nhật trạng thái, ng duyệt
        request.setStatus(newStatus);
        request.setApproverStaffId(approverStaffId);

        // Nếu approve
        if (newStatus.equals("Approved")) {

            // Xử lí xin nghỉ
            if ("Leave".equals(request.getRequestType())) {

                Schedule scheduleToCancel = scheduleRepository.findById(request.getScheduleId()).orElseThrow();

                scheduleToCancel.setStatus("Leave");
                scheduleRepository.save(scheduleToCancel);
            }

            // Xử lí đổi ca
            if ("Change".equals(request.getRequestType())) {
                // Lấy ID của người chấp nhận đổi
                Long accepterStaffId = request.getAcceptingStaffId();
                if (accepterStaffId == null) {
                    throw new IllegalArgumentException("Unable to approve: This shift change request does not have accepting staff.");
                }

                // Lấy lịch của ng yêu cầu
                Schedule scheduleA = scheduleRepository.findById(request.getScheduleId())
                        .orElseThrow(() -> new NoSuchElementException("The requester's calendar was not found."));

                //Lấy lịch của người đồng ý
                Schedule scheduleB = scheduleRepository.findByStaffIdAndWorkDate(accepterStaffId, scheduleA.getWorkDate())
                        .orElseThrow(() -> new NoSuchElementException("No accepting staff calendar found on date" + scheduleA.getWorkDate()));

                // Đổi ca

                Long shiftIdA = scheduleA.getShiftId();
                Long shiftIdB = scheduleB.getShiftId();

                scheduleA.setShiftId(shiftIdB);
                scheduleB.setShiftId(shiftIdA);

                scheduleRepository.save(scheduleA);
                scheduleRepository.save(scheduleB);
            }
        }
        scheduleRequestRepository.save(request);
    }
}
