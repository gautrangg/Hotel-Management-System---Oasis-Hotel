package backend.controller;

import backend.entity.ShiftType;
import backend.service.ShiftTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shift-types")
public class ShiftTypeController {

    @Autowired
    private final ShiftTypeService shiftTypeService;

    public ShiftTypeController(ShiftTypeService shiftTypeService) {
        this.shiftTypeService = shiftTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ShiftType>> getAllShiftTypes() {
        return ResponseEntity.ok(shiftTypeService.getAllShiftTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShiftType> getShiftTypeById(@PathVariable Long id) {
        ShiftType st = shiftTypeService.getShiftTypeById(id)
                .orElseThrow(() -> new RuntimeException("ShiftType not found"));
        return ResponseEntity.ok(st);
    }

    @PostMapping
    public ResponseEntity<?> createShiftType(@RequestBody ShiftType shiftType) {
        try {
            ShiftType created = shiftTypeService.createShiftType(shiftType);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShiftType(@PathVariable Long id, @RequestBody ShiftType shiftType) {
        try {
            ShiftType updated = shiftTypeService.updateShiftType(id, shiftType);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShiftType(@PathVariable Long id) {
        try {
            shiftTypeService.deleteShiftType(id);
            return ResponseEntity.ok("ShiftType deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}
