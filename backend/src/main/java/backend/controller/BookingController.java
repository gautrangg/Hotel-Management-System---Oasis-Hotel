package backend.controller;

import backend.dto.booking.*;
import backend.dto.payment.InvoiceDetailDTO;
import backend.entity.Booking;
import backend.entity.Room;
import backend.security.CustomUserDetails;
import backend.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingDetailDTO>> getBookingsByCustomerId(@PathVariable Long customerId) {
        List<BookingDetailDTO> bookings = bookingService.getBookingDetailsByCustomerId(customerId);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/my-bookings/cancel/{bookingId}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId) {
        try {
            bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok("Booking cancellation successful.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingDetailDTO>> getMyBookings(@AuthenticationPrincipal CustomUserDetails user) {
        List<BookingDetailDTO> bookings = bookingService.getBookingDetailsByCustomerId(user.getId());
        return ResponseEntity.ok(bookings);
    }

    // Booking offline : Confirm
    @PostMapping("/reception-create")
    public ResponseEntity<?> createReceptionBooking(@RequestBody ConfirmRecepBookingRequestDTO requestDTO) {
        try {
            Booking confirmedBooking = bookingService.confirmReceptionBooking(
                    requestDTO.getBookingId(),
                    requestDTO.getCustomerName(),
                    requestDTO.getCustomerEmail(),
                    requestDTO.getCustomerPhone(),
                    requestDTO.getPaymentMethod(),
                    requestDTO.getStaffId()
            );
            return ResponseEntity.ok(confirmedBooking);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Server Error");
        }
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateBooking(
            @RequestBody InitiateBookingRequestDTO requestDTO,
            @RequestParam Long customerId) {
        try {
            Booking pendingBooking = bookingService.initiateBooking(
                    customerId,
                    requestDTO.getRoomId(),
                    requestDTO.getCheckinDate(),
                    requestDTO.getCheckoutDate(),
                    requestDTO.getAdult(),
                    requestDTO.getChildren()
            );
            return ResponseEntity.ok(Map.of("bookingId", pendingBooking.getBookingId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Server Error");
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmBooking(@RequestBody ConfirmBookingRequestDTO requestDTO) {
        try {
            Booking confirmedBooking = bookingService.confirmBooking(
                    requestDTO.getBookingId(),
                    requestDTO.getCustomerName(),
                    requestDTO.getCustomerEmail(),
                    requestDTO.getCustomerPhone(),
                    requestDTO.getPaymentIntentId()
            );
            return ResponseEntity.ok(confirmedBooking);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Server Error");
        }
    }

    @GetMapping("/confirmation-details/{bookingId}")
    public ResponseEntity<?> getBookingDetailsForConfirmation(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            return ResponseEntity.status(401).body("Authentication required.");
        }

        try {
            BookingDetailDTO bookingDetails = bookingService.getBookingDetailsForConfirmation(bookingId, user.getId());
            return ResponseEntity.ok(bookingDetails);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/cancel-pending/{bookingId}")
    public ResponseEntity<?> cancelPendingBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            return ResponseEntity.status(401).body("Authentication required.");
        }

        try {
            bookingService.cancelAndPurgePendingBooking(bookingId, user.getId());
            return ResponseEntity.ok(Map.of("message", "Pending booking was successfully deleted."));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/available-rooms")
    public ResponseEntity<?> getAvailableRooms(
            @RequestParam Long roomTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkinDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkoutDate) {
        try {
            List<Room> rooms = bookingService.getAvailableRooms(roomTypeId, checkinDate, checkoutDate);
            return ResponseEntity.ok(rooms);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/check-in-list")
    public ResponseEntity<List<BookingCheckInInfoDTO>> getCheckInListForToday() {
        return ResponseEntity.ok(bookingService.getCheckInList());
    }

    @PostMapping("/{bookingId}/check-in")
    public ResponseEntity<String> performCheckIn(@PathVariable Long bookingId, @RequestBody CheckInRequestDTO request) {
        try {
            bookingService.performCheckIn(bookingId, request);
            return ResponseEntity.ok("Check-in successfully for booking ID: " + bookingId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Check-in failed: " + e.getMessage());
        }
    }

    @GetMapping("/check-out-list")
    public ResponseEntity<List<BookingCheckOutInfoDTO>> getCheckOutList() {
        return ResponseEntity.ok(bookingService.getCheckOutList());
    }

    @GetMapping("/{bookingId}/invoice-details")
    public ResponseEntity<?> getInvoiceDetails(@PathVariable Long bookingId) {
        try {
            InvoiceDetailDTO details = bookingService.getInvoiceDetails(bookingId);
            return ResponseEntity.ok(details);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error get invoice: " + e.getMessage());
        }
    }

    /**
        Gọi: xử lý thanh toán => bookingService.performCheckOut(bookingId, request).
        Trả về: "Check-out successfully".
     */
    @PostMapping("/{bookingId}/check-out")
    public ResponseEntity<String> performCheckOut(@PathVariable Long bookingId, @RequestBody CheckOutRequestDTO request) {
        try {
            bookingService.performCheckOut(bookingId, request);
            return ResponseEntity.ok("Check-out successfully for booking ID: " + bookingId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Check-out failed: " + e.getMessage());
        }
    }

    @PostMapping("/{bookingId}/calculate-checkout")
    public ResponseEntity<?> calculateCheckout(@PathVariable Long bookingId, @RequestBody CheckOutRequestDTO request) {
        try {
            LocalDateTime checkoutTime = request.getActualCheckoutTime() != null ? 
                request.getActualCheckoutTime() : LocalDateTime.now();
            CheckoutCalculationDTO calculation = bookingService.calculateCheckout(bookingId, checkoutTime);
            return ResponseEntity.ok(calculation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Fail Calculating: " + e.getMessage());
        }
    }

    // ============================================================
// ENDPOINT 1: GET BOOKING DETAIL
// ============================================================
    @GetMapping("/{bookingId}/detail")
    public ResponseEntity<?> getBookingDetailForCustomer(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized.");
        }

        try {
            BookingDetailFullDTO details = bookingService.getBookingDetailFull(bookingId, user.getId());
            return ResponseEntity.ok(details);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body("You have no permission to view this booking: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error server: " + e.getMessage());
        }
    }

    // ============================================================
// ENDPOINT 2: DELETE SERVICE REQUEST
// ============================================================
    @DeleteMapping("/{bookingId}/service-requests/{requestId}")
    public ResponseEntity<?> deleteServiceRequest(
            @PathVariable Long bookingId,
            @PathVariable Long requestId,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized.");
        }

        try {
            bookingService.deleteServiceRequest(bookingId, requestId, user.getId());
            return ResponseEntity.ok("Remove Request Successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-bookings/active/rooms")
    public ResponseEntity<List<ActiveRoomBookingDTO>> getMyActiveRooms(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        List<ActiveRoomBookingDTO> activeRoomsDTO = bookingService.getActiveRoomsForCustomer(user.getId());
        return ResponseEntity.ok(activeRoomsDTO);
    }


    // ============================================================
    // ADMIN ENDPOINTS
    // ============================================================
    
    /**
     * API 1: get list booking for admin
     * GET /api/bookings/admin/list
     */
    @GetMapping("/admin/list")
    public ResponseEntity<?> getBookingsForAdmin(
            @RequestParam(value = "search", required = false) String searchTerm,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "createAt") String sort,
            @RequestParam(value = "direction", defaultValue = "desc") String direction) {
        
        try {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, 
                direction.equalsIgnoreCase("desc") ? 
                    org.springframework.data.domain.Sort.by(sort).descending() : 
                    org.springframework.data.domain.Sort.by(sort).ascending()
            );
            
            org.springframework.data.domain.Page<AdminBookingListDTO> result = bookingService.getBookingsForAdmin(searchTerm, status, pageable);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error get bookings: " + e.getMessage());
        }
    }
    
    /**
     * API 2: get detail Booking for Admin
     * GET /api/bookings/admin/detail/{bookingId}
     */
    @GetMapping("/admin/detail/{bookingId}")
    public ResponseEntity<?> getBookingDetailForAdmin(@PathVariable Long bookingId) {
        try {
            AdminBookingDetailDTO detail = bookingService.getBookingDetailForAdmin(bookingId);
            return ResponseEntity.ok(detail);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error server: " + e.getMessage());
        }
    }
    
    /**
     * API 3: Update Booking for Admin
     * PUT /api/bookings/admin/update/{bookingId}
     */
    @PutMapping("/admin/update/{bookingId}")
    public ResponseEntity<?> updateBookingForAdmin(
            @PathVariable Long bookingId,
            @RequestBody AdminBookingUpdateDTO updateDTO) {
        
        try {
            updateDTO.setBookingId(bookingId); // Đảm bảo bookingId trong DTO
            bookingService.updateBookingForAdmin(bookingId, updateDTO);
            return ResponseEntity.ok("Update Booking Successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Err: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Err server: " + e.getMessage());
        }
    }
    
    /**
     * API 4: Cancel Booking for Admin
     * PUT /api/bookings/admin/cancel/{bookingId}
     */
    @PutMapping("/admin/cancel/{bookingId}")
    public ResponseEntity<?> cancelBookingForAdmin(@PathVariable Long bookingId) {
        try {
            bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok("Cancel Booking Successfully.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error server: " + e.getMessage());
        }
    }
}