package backend.service;

import backend.entity.Feedback;
import backend.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    // Tạo feedback mới
    @Transactional
    public Feedback createFeedback(Feedback feedback) {
        // Kiểm tra đã có feedback cho booking này chưa
        if (feedbackRepository.existsByBookingId(feedback.getBookingId())) {
            throw new RuntimeException("Feedback already exists for this booking");
        }

        // Validate rating (1-5)
        if (feedback.getRating() < 1 || feedback.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        return feedbackRepository.save(feedback);
    }

    // Lấy feedback theo booking ID
    public Optional<Feedback> getFeedbackByBookingId(Long bookingId) {
        return feedbackRepository.findByBookingId(bookingId);
    }

    // Cập nhật feedback (không giới hạn thời gian)
    @Transactional
    public Feedback updateFeedback(Long feedbackId, Long customerId, Integer rating, String description) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        // Kiểm tra feedback có thuộc về customer này không
        if (!feedback.getCustomerId().equals(customerId)) {
            throw new RuntimeException("You don't have permission to update this feedback");
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        feedback.setRating(rating);
        feedback.setDescription(description);

        return feedbackRepository.save(feedback);
    }

    // Xóa feedback (không giới hạn thời gian)
    @Transactional
    public void deleteFeedback(Long feedbackId, Long customerId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        // Kiểm tra feedback có thuộc về customer này không
        if (!feedback.getCustomerId().equals(customerId)) {
            throw new RuntimeException("You don't have permission to delete this feedback");
        }

        feedbackRepository.delete(feedback);
    }

    // Lấy N feedbacks mới nhất (cho Home page)
    public List<Feedback> getLatestFeedbacks(int limit) {
        // Lấy tối đa 10 feedbacks mới nhất
        return feedbackRepository.findTop10ByOrderByFeedbackIdDesc();
    }

    // Lấy tất cả feedbacks (cho All Feedbacks page)
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByFeedbackIdDesc();
    }

    // Lấy feedbacks theo bookingId list (để lấy feedback của một phòng cụ thể)
    public List<Feedback> getFeedbacksByBookingIds(List<Long> bookingIds) {
        return feedbackRepository.findByBookingIdIn(bookingIds);
    }
}