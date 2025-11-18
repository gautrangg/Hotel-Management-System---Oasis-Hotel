package backend.controller;

import backend.dto.service.UpdateStatusRequestDTO;
import backend.entity.ServiceRequest;
import backend.dto.service.ServiceRequestInfoDTO;
import backend.service.ServiceRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import backend.security.CustomUserDetails;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@CrossOrigin(origins = "http://localhost:61924")
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    public ServiceRequestController(ServiceRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public List<ServiceRequest> getAll() {
        return requestService.getAll();
    }

    @GetMapping("/{id}")
    public ServiceRequest getById(@PathVariable Long id) {
        return requestService.getById(id);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ServiceRequest create(
            @RequestParam("serviceId") Long serviceId,
            @RequestParam(value = "bookingId", required = false) Long bookingId,
            @RequestParam(value = "staffId", required = false) Long staffId,
            @RequestParam(value = "quantity", required = false, defaultValue = "1") Integer quantity,
            @RequestParam(value = "requestTime", required = false) String requestTimeStr,
            @RequestParam(value = "status", required = false, defaultValue = "Pending") String status

    ) {

        LocalDateTime requestTime = LocalDateTime.now();

        ServiceRequest req = new ServiceRequest(
                null,
                1L,
                serviceId,
                staffId,
                quantity,
                requestTime,
                requestTime,
                "",
                status);

        return requestService.create(req);
    }

    /**
     * Create ServiceRequest via JSON body (application/json).
     * This endpoint exists alongside the form-data POST to support typical
     * FE/POSTMAN JSON calls.
     */
    @PostMapping(consumes = "application/json")
    public ResponseEntity<ServiceRequest> createJson(@RequestBody ServiceRequest request) {
        try {
            ServiceRequest created = requestService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PUT /api/service-requests/{id}/status
     * Update the status of a service request.
     * Request body should be a JSON object: { "status": "Pending" | "On Progress" |
     * "Completed" | "Cancelled" }
     * 
     * Valid status values:
     * - Pending: Request is waiting to be assigned
     * - On Progress: Request is being processed
     * - Completed: Request has been completed
     * - Cancelled: Request has been cancelled
     * 
     * @param id  the service request id
     * @param dto contains the new status value
     * @return updated ServiceRequest with 200 OK, or error message with appropriate
     *         status code
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequestDTO dto) {
        try {
            if (dto == null || dto.getStatus() == null || dto.getStatus().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Status is required. Valid statuses are: Pending, On Progress, Completed, Cancelled");
            }

            ServiceRequest updatedRequest = requestService.updateStatus(id, dto.getStatus());
            return ResponseEntity.ok(updatedRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Service request not found with id: " + id);
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignStaff(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        try {
            ServiceRequest updated = requestService.assignStaff(id, staffId);

            updated.setStatus("Assigned");
            requestService.update(id, updated);

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        requestService.delete(id);
    }

    /**
     * Full update of a ServiceRequest by id using JSON body.
     */
    @PutMapping(value = "/{id}", consumes = "application/json")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ServiceRequest request) {
        try {
            ServiceRequest updated = requestService.update(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(iae.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating service request.");
        }
    }

    @GetMapping("/details")
    public ResponseEntity<List<ServiceRequestInfoDTO>> getAllDetails() {
        List<ServiceRequestInfoDTO> details = requestService.getAllServiceRequestDetails();
        return ResponseEntity.ok(details);
    }

    /**
     * GET /api/service-requests/assigned
     * Trả về danh sách các service request được assign cho staff đang đăng nhập
     */

    @GetMapping("/assigned")
    public ResponseEntity<List<ServiceRequestInfoDTO>> getAssignedForCurrentUser(
            @AuthenticationPrincipal CustomUserDetails user) {
        if (user == null || user.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long staffId = user.getId();
        List<ServiceRequestInfoDTO> assignedRequests = requestService.getAssignedServiceRequestDetails(staffId);
        return ResponseEntity.ok(assignedRequests);
    }

    @GetMapping("/assigned/{staffId}")
    public ResponseEntity<List<ServiceRequestInfoDTO>> getAssignedByStaffId(@PathVariable Long staffId) {
        List<ServiceRequestInfoDTO> assignedRequests = requestService.getAssignedServiceRequestDetails(staffId);
        return ResponseEntity.ok(assignedRequests);
    }

    /**
     * GET /api/service-requests/assigned/{staffId}
     * Trả về danh sách các service request được assign cho staff có id = {staffId}.
     * Endpoint này hữu ích để test bằng Postman (không phụ thuộc vào security
     * principal).
     */

    /**
     * PUT /api/service-requests/{id}/status-by-staff
     * Staff cập nhật status cho service request nếu request đó đã được assign cho
     * chính họ
     */
    @PutMapping("/{id}/status-by-staff")
    public ResponseEntity<?> updateStatusByStaff(@PathVariable Long id,
            @RequestBody UpdateStatusRequestDTO body,
            @AuthenticationPrincipal CustomUserDetails user) {
        try {
            if (user == null || user.getId() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
            }

            if (body == null || body.getStatus() == null || body.getStatus().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Missing status in request body");
            }

            ServiceRequest updated = requestService.updateStatusByStaff(id, user.getId(), body.getStatus().trim());
            return ResponseEntity.ok(updated);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(se.getMessage());
        } catch (IllegalArgumentException ie) {
            return ResponseEntity.badRequest().body(ie.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating status.");
        }
    }

    @PostMapping("/create-request")
    public ResponseEntity<?> createServiceRequest(
            @RequestParam("serviceId") Long serviceId,
            @RequestParam("bookingId") Long bookingId,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "expectedTime", required = false) LocalDateTime expectedTime,
            @RequestParam("note") String note) {
        try {
            ServiceRequest newRequest = requestService.createRequest(serviceId, bookingId, quantity, note,
                    expectedTime);
            return ResponseEntity.ok(newRequest);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing the request.");
        }
    }

    /**
     * PUT /api/service-requests/{id}/complete
     * Mark a service request as completed (kept for backward compatibility)
     * 
     * @deprecated Use PUT /api/service-requests/{id}/status with body {"status":
     *             "Completed"} instead
     */
    @Deprecated
    @PutMapping("/{id}/complete")
    public ResponseEntity<ServiceRequest> markAsCompleted(@PathVariable Long id) {
        try {
            ServiceRequest updatedRequest = requestService.markAsCompleted(id);
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/service-requests/completed/{staffId}
     * Trả về danh sách các service request đã completed của staff có id = {staffId}
     */
    @GetMapping("/completed/{staffId}")
    public ResponseEntity<List<ServiceRequestInfoDTO>> getCompletedByStaffId(@PathVariable Long staffId) {
        List<ServiceRequestInfoDTO> completedRequests = requestService.getCompletedServiceRequestDetails(staffId);
        return ResponseEntity.ok(completedRequests);
    }
}