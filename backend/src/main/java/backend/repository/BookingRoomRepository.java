package backend.repository;

import backend.entity.BookingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRoomRepository extends JpaRepository<BookingRoom, Long> {
    List<BookingRoom> findByBookingId(Long bookingId);
    List<BookingRoom> findByBookingIdIn(List<Long> bookingIds);
    void deleteAllByBookingId(Long bookingId);
    // Xin của quỳnh Lấy về Dashboard
    Optional<BookingRoom> findFirstByBookingId(Long bookingId);


}