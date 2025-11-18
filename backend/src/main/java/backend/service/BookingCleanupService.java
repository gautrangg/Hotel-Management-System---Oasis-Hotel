package backend.service;

import backend.entity.Booking;
import backend.repository.BookingRepository;
import backend.repository.BookingRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(BookingCleanupService.class);

    private final BookingRepository bookingRepository;
    private final BookingRoomRepository bookingRoomRepository;

    public BookingCleanupService(BookingRepository bookingRepository, BookingRoomRepository bookingRoomRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingRoomRepository = bookingRoomRepository;
    }

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void cleanupPendingBookings() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);

        List<Booking> expiredBookings = bookingRepository.findPendingBookingsOlderThan(cutoffTime);

        if (expiredBookings.isEmpty()) {
            return;
        }

        logger.warn("Tìm thấy {} booking PENDING quá hạn. Bắt đầu xóa...", expiredBookings.size());

        for (Booking booking : expiredBookings) {
            logger.warn("Đang xóa booking ID: {} (tạo lúc: {})", booking.getBookingId(), booking.getCreateAt());

            bookingRoomRepository.deleteAllByBookingId(booking.getBookingId());
            bookingRepository.delete(booking);
        }
        logger.info("Hoàn tất tác vụ dọn dẹp.");
    }
}