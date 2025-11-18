package backend.controller;

import backend.dto.manager.StaffDTO;
import backend.entity.Staff;
import backend.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staffs")
@CrossOrigin(origins = "http://localhost:61924")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @GetMapping("/all")
    public List<Staff> getAllStaffs() {
        return staffService.getAllStaffs();
    }

    @GetMapping
    public ResponseEntity<?> getActiveStaffs() {
        try {
            List<Staff> activeStaffs = staffService.getActiveStaffs();
            return ResponseEntity.ok(activeStaffs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching active staffs");
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String value) {
        return ResponseEntity.ok(Map.of("exists", staffService.checkEmailExists(value)));
    }

    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhone(@RequestParam String value) {
        return ResponseEntity.ok(Map.of("exists", staffService.checkPhoneExists(value)));
    }

    @GetMapping("/check-citizen-id")
    public ResponseEntity<?> checkCitizenId(@RequestParam String value) {
        return ResponseEntity.ok(Map.of("exists", staffService.checkCitizenIdExists(value)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        try {
            Staff staff = staffService.getStaffById(id);
            if (staff == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Staff not found");
            }
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching staff details");
        }
    }


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addStaff(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("fullName") String fullName,
            @RequestParam("password") String password,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam(value = "citizenId", required = false) String citizenId,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam("birthDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDate,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam("roleId") Integer roleId,
            @RequestParam("shiftTypeId") Integer shiftTypeId,
            @RequestParam(value = "chargedDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate chargedDate,
            @RequestParam("dayOff") Integer dayOff,
            @RequestParam(value = "isActive", required = false) Boolean isActive
    ) {
        try {
            staffService.addStaff(file, fullName, password, email, phone, citizenId, gender,
                    birthDate, address, roleId, shiftTypeId, chargedDate, dayOff, isActive);
            return ResponseEntity.ok("Staff added successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding staff");
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateStaff(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("fullName") String fullName,
            @RequestParam("password") String password,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam(value = "citizenId", required = false) String citizenId,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam("birthDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDate,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam("roleId") Integer roleId,
            @RequestParam("shiftTypeId") Integer shiftTypeId,
            @RequestParam(value = "chargedDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate chargedDate,
            @RequestParam("dayOff") Integer dayOff,
            @RequestParam(value = "isActive", required = false) Boolean isActive
    ) {
        try {
            staffService.updateStaff(id, file, fullName, password, email, phone, citizenId, gender,
                    birthDate, address, roleId, shiftTypeId, chargedDate, dayOff, isActive);
            return ResponseEntity.ok("Staff updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating staff");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        try {
            staffService.softDeleteStaff(id);
            return ResponseEntity.ok("Staff deactivated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deactivating staff");
        }
    }

    @GetMapping("/available-housekeepers")
    public ResponseEntity<List<StaffDTO>> getAvailableHousekeepers() {
        List<StaffDTO> housekeepers = staffService.getAvailableHousekeepersNow();
        return ResponseEntity.ok(housekeepers);
    }

    @GetMapping("/available-service-staffs")
    public ResponseEntity<List<StaffDTO>> getAvailableServiceStaffs() {
        List<StaffDTO> housekeepers = staffService.getAvailableServiceStaffsNow();
        return ResponseEntity.ok(housekeepers);
    }
}
