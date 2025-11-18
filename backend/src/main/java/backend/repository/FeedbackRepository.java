package backend.repository;

import backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Tìm feedback theo booking ID
    Optional<Feedback> findByBookingId(Long bookingId);

    // Tìm feedback theo booking ID và customer ID
    Optional<Feedback> findByBookingIdAndCustomerId(Long bookingId, Long customerId);

    // Kiểm tra feedback đã tồn tại cho booking chưa
    boolean existsByBookingId(Long bookingId);

    // Lấy N feedbacks mới nhất (cho Home page)
    // Spring Data JPA sẽ tự động implement method này
    List<Feedback> findTop10ByOrderByFeedbackIdDesc();

    // Lấy tất cả feedbacks, sắp xếp theo ID giảm dần
    List<Feedback> findAllByOrderByFeedbackIdDesc();

    // Lấy feedbacks theo danh sách booking IDs
    List<Feedback> findByBookingIdIn(List<Long> bookingIds);
}