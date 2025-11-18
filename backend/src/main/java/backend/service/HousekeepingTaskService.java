package backend.service;

import backend.dto.housekeeping.HousekeepingTaskDTO;
import backend.entity.BookingRoom;
import backend.entity.HousekeepingTask;
import backend.entity.Room;
import backend.entity.Staff;
import backend.repository.BookingRoomRepository;
import backend.repository.HousekeepingTaskRepository;
import backend.repository.RoomRepository;
import backend.repository.StaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class HousekeepingTaskService {

    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final StaffRepository staffRepository;
    private final RoomRepository roomRepository;
    private final BookingRoomRepository bookingRoomRepository;
    private final EmailService emailService;

    public HousekeepingTaskService(HousekeepingTaskRepository housekeepingTaskRepository, StaffRepository staffRepository, RoomRepository roomRepository, BookingRoomRepository bookingRoomRepository, EmailService emailService) {
        this.housekeepingTaskRepository = housekeepingTaskRepository;
        this.staffRepository = staffRepository;
        this.roomRepository = roomRepository;
        this.bookingRoomRepository = bookingRoomRepository;
        this.emailService = emailService;
    }

    public Map<String, List<HousekeepingTaskDTO>> getTasksForStaff(Long staffId) {
        List<HousekeepingTaskDTO> allTasks = housekeepingTaskRepository.findTasksByStaffId(staffId);

        if (!allTasks.isEmpty()) {
            Staff staff = staffRepository.findById(staffId)
                    .orElse(null);
            if (staff != null) {
                allTasks.forEach(task -> task.setStaffName(staff.getFullName()));
            }
        }

        List<HousekeepingTaskDTO> currentTasks = allTasks.stream()
                .filter(task -> "Assigned".equalsIgnoreCase(task.getStatus()) || "In Progress".equalsIgnoreCase(task.getStatus()))
                .collect(Collectors.toList());

        List<HousekeepingTaskDTO> historyTasks = allTasks.stream()
                .filter(task -> "Completed".equalsIgnoreCase(task.getStatus()) || "Cancelled".equalsIgnoreCase(task.getStatus()))
                .collect(Collectors.toList());

        return Map.of(
                "currentTasks", currentTasks,
                "historyTasks", historyTasks
        );
    }
    @Transactional
    public HousekeepingTaskDTO updateTask(Long taskId, Map<String, Object> updates) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        BookingRoom br = bookingRoomRepository.findById(task.getBookingRoomId()).stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Not Found BookingRoom ID: " + task.getBookingRoomId()));
        String note = (String) updates.get("note");
        String status = (String) updates.get("status");

        if (note != null) {
            task.setNote(note);
        }
        if (status != null) {
            task.setStatus(status);
        }

        if ("Completed".equalsIgnoreCase(status)) {
            task.setFinishTime(LocalDateTime.now());
            Room room = roomRepository.findById(br.getRoomId()).orElseThrow();
            room.setStatus("Available");
            roomRepository.save(room);
        } else if ("Assigned".equalsIgnoreCase(status) || "In Progress".equalsIgnoreCase(status)) {
            task.setFinishTime(null);
            Room room = roomRepository.findById(br.getRoomId()).orElseThrow();
            room.setStatus("Cleaning");
            roomRepository.save(room);
        }

        HousekeepingTask updatedTask = housekeepingTaskRepository.save(task);

        HousekeepingTaskDTO updatedDto = housekeepingTaskRepository.findTasksByStaffId(updatedTask.getStaffId()).stream()
                .filter(dto -> dto.getTaskId().equals(updatedTask.getTaskId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Could not retrieve updated task DTO."));

        Staff staff = staffRepository.findById(updatedTask.getStaffId())
                .orElseThrow(() -> new RuntimeException("Staff not found with id: " + updatedTask.getStaffId()));

        updatedDto.setStaffName(staff.getFullName());

        return updatedDto;
    }

    @Transactional
    public HousekeepingTask assignTask(HousekeepingTask request) {
        List<HousekeepingTask> activeTasks = housekeepingTaskRepository.findByBookingRoomIdAndStatusNot(
                request.getBookingRoomId(),
                "Completed"
        );

        activeTasks = activeTasks.stream()
                .filter(task -> !"Cancelled".equalsIgnoreCase(task.getStatus()))
                .collect(Collectors.toList());

        if (!activeTasks.isEmpty()) {
            throw new IllegalStateException("An active housekeeping task already exists for this booking room.");
        }

        HousekeepingTask newTask = new HousekeepingTask();
        newTask.setBookingRoomId(request.getBookingRoomId());
        newTask.setStaffId(request.getStaffId());
        newTask.setNote(request.getNote());

        newTask.setAssignTime(LocalDateTime.now());
        newTask.setStatus("Assigned");

        HousekeepingTask savedTask = housekeepingTaskRepository.save(newTask);

        try {
            Staff staff = staffRepository.findById(request.getStaffId())
                    .orElseThrow(() -> new RuntimeException("Staff not found with ID: " + request.getStaffId()));
            String room = roomRepository.findById(bookingRoomRepository.findById(savedTask.getBookingRoomId()).get().getRoomId()).get().getRoomNumber();

            String subject = "New Housekeeping Task Assigned";
            String body = "<p>Hi, "+ staff.getFullName() +",</p>"
                    + "<p>You have been assigned a new housekeeping task for room: <b>"
                    + room + "</b>.</p>"
                    + "<p>Assigned at: " + savedTask.getAssignTime() + "</p>"
                    + "<p>Please complete it as soon as possible.</p>";

            emailService.sendHtmlEmail(staff.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send email to staff: " + e.getMessage());
        }

        return savedTask;
    }
    public String getNotesForBookingRoom(Long bookingRoomId) {
        List<HousekeepingTask> tasks = housekeepingTaskRepository.findByBookingRoomId(bookingRoomId);

        return tasks.stream()
                .map(HousekeepingTask::getNote)
                .filter(Objects::nonNull)
                .filter(note -> !note.trim().isEmpty())
                .collect(Collectors.joining("\n"));
    }

    public Optional<HousekeepingTaskDTO> getActiveTaskByBookingRoomId(Long bookingRoomId) {
        List<HousekeepingTask> activeTasks = housekeepingTaskRepository.findByBookingRoomIdAndStatusNot(
                bookingRoomId,
                "Completed"
        );

        Optional<HousekeepingTask> activeTaskEntityOpt = activeTasks.stream()
                .filter(task -> !"Cancelled".equalsIgnoreCase(task.getStatus()))
                .findFirst();

        if (activeTaskEntityOpt.isEmpty()) {
            return Optional.empty();
        }

        HousekeepingTask activeTask = activeTaskEntityOpt.get();
        Long staffId = activeTask.getStaffId();
        Long taskId = activeTask.getTaskId();

        Optional<HousekeepingTaskDTO> taskDtoOpt = housekeepingTaskRepository.findTasksByStaffId(staffId).stream()
                .filter(dto -> dto.getTaskId().equals(taskId))
                .findFirst();

        if (taskDtoOpt.isEmpty()) {
            return Optional.empty();
        }

        HousekeepingTaskDTO taskDto = taskDtoOpt.get();

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found for task, id: " + staffId));

        taskDto.setStaffName(staff.getFullName());

        return Optional.of(taskDto);
    }
}
