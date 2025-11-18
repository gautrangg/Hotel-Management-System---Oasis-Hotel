package backend.controller;

import backend.entity.Feedback;
import backend.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // Tạo feedback mới
    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody Feedback feedback) {
        try {
            Feedback createdFeedback = feedbackService.createFeedback(feedback);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lấy feedback theo booking ID
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getFeedbackByBooking(@PathVariable Long bookingId) {
        Optional<Feedback> feedback = feedbackService.getFeedbackByBookingId(bookingId);
        if (feedback.isPresent()) {
            return ResponseEntity.ok(feedback.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Cập nhật feedback
    @PutMapping("/{feedbackId}")
    public ResponseEntity<?> updateFeedback(
            @PathVariable Long feedbackId,
            @RequestBody Feedback feedbackRequest) {
        try {
            Feedback updatedFeedback = feedbackService.updateFeedback(
                    feedbackId,
                    feedbackRequest.getCustomerId(),
                    feedbackRequest.getRating(),
                    feedbackRequest.getDescription()
            );
            return ResponseEntity.ok(updatedFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Xóa feedback
    @DeleteMapping("/{feedbackId}")
    public ResponseEntity<?> deleteFeedback(
            @PathVariable Long feedbackId,
            @RequestParam Long customerId) {
        try {
            feedbackService.deleteFeedback(feedbackId, customerId);
            return ResponseEntity.ok("Feedback deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lấy N feedbacks mới nhất (cho Home page)
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestFeedbacks(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Feedback> feedbacks = feedbackService.getLatestFeedbacks(limit);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lấy tất cả feedbacks (cho All Feedbacks page)
    @GetMapping("/all")
    public ResponseEntity<?> getAllFeedbacks() {
        try {
            List<Feedback> feedbacks = feedbackService.getAllFeedbacks();
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lấy feedbacks theo room ID (cho Room Detail page)
    // Note: Cần tích hợp với BookingService để lấy bookingIds của room
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getFeedbacksByRoom(@PathVariable Long roomId) {
        try {
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
