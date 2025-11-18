package backend.service;

import backend.dto.manager.StaffDTO;
import backend.entity.Role;
import backend.entity.Staff;
import backend.repository.RoleRepository;
import backend.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StaffService {

    private static final String UPLOAD = "upload/avatar/";

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private RoleRepository roleRepository;

    public List<Staff> getAllStaffs() {
        return staffRepository.findAll();
    }

    public Optional<Staff> findById(Long staffId) {
        return staffRepository.findById(staffId);
    }

    public boolean checkEmailExists(String email) {
        return staffRepository.existsByEmail(email);
    }

    public boolean checkPhoneExists(String phone) {
        return staffRepository.existsByPhone(phone);
    }

    public boolean checkCitizenIdExists(String citizenId) {
        return staffRepository.existsByCitizenId(citizenId);
    }

    public Optional<Map<String, Object>> loginStaff(String email, String password) {
        var staffOpt = staffRepository.findByEmailAndPasswordAndIsActive(email, password, true);
        if (staffOpt.isEmpty()) return Optional.empty();

        Staff staff = staffOpt.get();

        Map<String, Object> result = new HashMap<>();
        result.put("staff", staff);

        Integer roleId = staff.getRoleId();
        if (roleId != null) {
            Optional<Role> roleOpt = roleRepository.findById(roleId.longValue());
            roleOpt.ifPresent(role -> result.put("role", role));
        } else {
            result.put("role", null);
        }

        return Optional.of(result);
    }

    public List<Staff> getActiveStaffs() {
        return staffRepository.findAll().stream()
                .filter(staff -> Boolean.TRUE.equals(staff.getActive()))
                .toList();
    }

    public Staff getStaffById(Long id) {
        return staffRepository.findById(id).orElse(null);
    }

    public Staff addStaff(MultipartFile file,
                          String fullName,
                          String password,
                          String email,
                          String phone,
                          String citizenId,
                          String gender,
                          LocalDate birthDate,
                          String address,
                          Integer roleId,
                          Integer shiftTypeId,
                          LocalDate chargedDate,
                          Integer dayOff,
                          Boolean isActive) throws Exception {

        String fileName = saveFile(file);

        Staff staff = new Staff();
        staff.setFullName(fullName);
        staff.setPassword(password);
        staff.setEmail(email);
        staff.setPhone(phone);
        staff.setCitizenId(citizenId);
        staff.setGender(gender);
        staff.setBirthDate(birthDate);
        staff.setAddress(address);

        staff.setRoleId(roleId);
        staff.setShiftTypeId(shiftTypeId != null ? shiftTypeId : 0);
        staff.setChargedDate(chargedDate != null ? chargedDate : LocalDate.now());
        staff.setDayOff(dayOff != null ? dayOff : 0);
        staff.setActive(isActive != null ? isActive : true);

        staff.setStaffImage(fileName != null ? fileName : "avatar.png");

        return staffRepository.save(staff);
    }

    public void deleteStaff(Long id) throws Exception {
        Optional<Staff> staffOpt = staffRepository.findById(id);
        if (staffOpt.isEmpty()) {
            throw new RuntimeException("Staff not found");
        }

        Staff staff = staffOpt.get();

        if (staff.getStaffImage() != null && !staff.getStaffImage().equals("avatar.png")) {
            Path filePath = Paths.get(UPLOAD, staff.getStaffImage());
            Files.deleteIfExists(filePath);
        }

        staffRepository.deleteById(id);
    }

    public Staff updateStaff(Long id,
                             MultipartFile file,
                             String fullName,
                             String password,
                             String email,
                             String phone,
                             String citizenId,
                             String gender,
                             LocalDate birthDate,
                             String address,
                             Integer roleId,
                             Integer shiftTypeId,
                             LocalDate chargedDate,
                             Integer dayOff,
                             Boolean isActive) throws Exception {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        if (file != null && !file.isEmpty()) {

            if (staff.getStaffImage() != null && !staff.getStaffImage().equals("avatar.png")) {
                Path oldFile = Paths.get(UPLOAD, staff.getStaffImage());
                Files.deleteIfExists(oldFile);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFileName = UUID.randomUUID().toString() + extension;
            Path newPath = Paths.get(UPLOAD, newFileName);
            Files.createDirectories(newPath.getParent());
            Files.copy(file.getInputStream(), newPath, StandardCopyOption.REPLACE_EXISTING);

            staff.setStaffImage(newFileName);
        }

        staff.setFullName(fullName);
        staff.setPassword(password);
        staff.setEmail(email);
        staff.setPhone(phone);
        staff.setCitizenId(citizenId);
        staff.setGender(gender);
        staff.setBirthDate(birthDate);
        staff.setAddress(address);
        staff.setRoleId(roleId);
        staff.setShiftTypeId(shiftTypeId != null ? shiftTypeId : staff.getShiftTypeId());
        staff.setChargedDate(chargedDate != null ? chargedDate : staff.getChargedDate());
        staff.setDayOff(dayOff != null ? dayOff : staff.getDayOff());
        staff.setActive(isActive != null ? isActive : staff.getActive());

        return staffRepository.save(staff);
    }

    public void softDeleteStaff(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        staff.setActive(false);
        staffRepository.save(staff);
    }

    public List<StaffDTO> getAvailableHousekeepersNow() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Staff> housekeepersEntities = staffRepository.findStaffByRoleAndCurrentShift("Housekeeper", today, now);

        return housekeepersEntities.stream().map(staffEntity -> {
            StaffDTO dto = new StaffDTO();
            dto.setStaffId(staffEntity.getStaffId());
            dto.setFullName(staffEntity.getFullName());
            dto.setEmail(staffEntity.getEmail());
            dto.setPhone(staffEntity.getPhone());
            dto.setCitizenId(staffEntity.getCitizenId());
            dto.setGender(staffEntity.getGender());
            dto.setBirthDate(staffEntity.getBirthDate());
            return dto;
        }).collect(Collectors.toList());
    }

    public List<StaffDTO> getAvailableServiceStaffsNow() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Staff> housekeepersEntities = staffRepository.findStaffByRoleAndCurrentShift("Service Staff", today, now);

        return housekeepersEntities.stream().map(staffEntity -> {
            StaffDTO dto = new StaffDTO();
            dto.setStaffId(staffEntity.getStaffId());
            dto.setFullName(staffEntity.getFullName());
            dto.setEmail(staffEntity.getEmail());
            dto.setPhone(staffEntity.getPhone());
            dto.setCitizenId(staffEntity.getCitizenId());
            dto.setGender(staffEntity.getGender());
            dto.setBirthDate(staffEntity.getBirthDate());
            return dto;
        }).collect(Collectors.toList());
    }

    private String saveFile(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) return null;

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = Paths.get(UPLOAD, fileName);
        Files.createDirectories(filePath.getParent());
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

}
