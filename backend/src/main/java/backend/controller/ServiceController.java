package backend.controller;

import backend.entity.Service;
import backend.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:61924")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping
    public List<Service> getAllServices() {
        return serviceService.getAllServices();
    }

    @GetMapping("/category/{categoryId}")
    public List<Service> getServicesByCategoryId(@PathVariable Long categoryId) {
        return serviceService.getServicesByCategoryId(categoryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        return serviceService.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ===================== CREATE =====================
    @PostMapping
    public ResponseEntity<Service> addService(
            @RequestParam(required = false) MultipartFile file,
            @RequestParam Long categoryId,
            @RequestParam String serviceName,
            @RequestParam BigDecimal pricePerUnit,
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) String description,
            @RequestParam(defaultValue = "false") Boolean needStaff,
            @RequestParam(defaultValue = "true") Boolean isActive,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime availableStartTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime availableEndTime
    ) throws Exception {
        Service created = serviceService.addService(
                file,
                categoryId,
                serviceName,
                pricePerUnit,
                unit,
                description,
                needStaff,
                isActive,
                availableStartTime,
                availableEndTime
        );
        return ResponseEntity.ok(created);
    }

    // ===================== UPDATE =====================
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam Long categoryId,
            @RequestParam String serviceName,
            @RequestParam BigDecimal pricePerUnit,
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) String description,
            @RequestParam(defaultValue = "false") Boolean needStaff,
            @RequestParam(defaultValue = "true") Boolean isActive,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime availableStartTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime availableEndTime
    ) throws Exception {
        Service updated = serviceService.updateService(
                id,
                file,
                categoryId,
                serviceName,
                pricePerUnit,
                unit,
                description,
                needStaff,
                isActive,
                availableStartTime,
                availableEndTime
        );
        return ResponseEntity.ok(updated);
    }

    // ===================== DELETE =====================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) throws Exception {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}