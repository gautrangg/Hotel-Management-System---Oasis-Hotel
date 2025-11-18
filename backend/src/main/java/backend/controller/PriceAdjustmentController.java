package backend.controller;

import backend.entity.PriceAdjustment;
import backend.service.PriceAdjustmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-adjustments")
public class PriceAdjustmentController {
    @Autowired
    private PriceAdjustmentService priceAdjustmentService;

    @GetMapping
    public ResponseEntity<List<PriceAdjustment>> getAllAdjustments() {
        List<PriceAdjustment> adjustments = priceAdjustmentService.getAllAdjustments();
        return ResponseEntity.ok(adjustments);
    }

    @PostMapping("/action")
    public ResponseEntity<?> createAdjustment(@RequestBody PriceAdjustment adjustment) {
        try {
            PriceAdjustment newAdjustment = priceAdjustmentService.createAdjustment(adjustment);
            return ResponseEntity.ok(newAdjustment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/action/{id}")
    public ResponseEntity<?> updateAdjustment(@PathVariable Long id, @RequestBody PriceAdjustment adjustmentDetails) {
        try {
            PriceAdjustment updatedAdjustment = priceAdjustmentService.updateAdjustment(id, adjustmentDetails);
            return ResponseEntity.ok(updatedAdjustment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/action/{id}")
    public ResponseEntity<?> deleteAdjustment(@PathVariable Long id) {
        try {
            priceAdjustmentService.deleteAdjustment(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
