package backend.repository;

import backend.dto.booking.ActiveRoomBookingDTO;
import backend.dto.room.RoomBookingScheduleDTO;
import backend.entity.Booking;
import backend.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByStatus(String status);

    Optional<Invoice> findByBookingId(Long bookingId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND CAST(b.checkinDate AS DATE) = :date")
    List<Booking> findConfirmedBookingsForCheckinOnDate(@Param("date") LocalDate date);

    @Query("""
        SELECT b
        FROM Booking b JOIN BookingRoom br ON b.bookingId = br.bookingId
        WHERE br.roomId = :roomId
        AND UPPER(b.status) NOT IN ('CANCELLED', 'CHECKED-OUT')
    """)
    List<Booking> findValidBookingsByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT b FROM Booking b JOIN BookingRoom br ON b.bookingId = br.bookingId " +
            "WHERE br.roomId = :roomId AND UPPER(b.status) IN :statuses " +
            "AND b.checkinDate < :endDate AND b.checkoutDate > :startDate")
    List<Booking> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("statuses") List<String> statuses
    );

    @Query("SELECT new backend.dto.room.RoomBookingScheduleDTO(br.roomId, b.checkinDate, b.checkoutDate) " +
            "FROM Booking b " +
            "JOIN BookingRoom br ON b.bookingId = br.bookingId " +
            "WHERE br.roomId IN :roomIds " +
            "AND UPPER(b.status) NOT IN ('CANCELLED', 'CHECKED-OUT')")
    List<RoomBookingScheduleDTO> findSchedulesByRoomIds(@Param("roomIds") List<Long> roomIds);

    @Query("SELECT new backend.dto.booking.ActiveRoomBookingDTO(" +
            "    r.roomId, r.roomNumber, r.floor, r.status, " +
            "    b.bookingId, b.checkinDate, b.checkoutDate, b.status, " +
            "    br.bookingRoomId, br.actualCheckin, br.actualCheckout" +
            ") " +
            "FROM Booking b " +
            "JOIN BookingRoom br ON b.bookingId = br.bookingId " +
            "JOIN Room r ON br.roomId = r.roomId " +
            "WHERE b.customerId = :customerId " +
            "AND UPPER(b.status) = 'CHECKED-IN' " +
            "AND :now BETWEEN b.checkinDate AND b.checkoutDate")
    List<ActiveRoomBookingDTO> findActiveRoomsByCustomerId(
            @Param("customerId") Long customerId,
            @Param("now") LocalDateTime now
    );

    @Query("SELECT b FROM Booking b WHERE UPPER(b.status) = 'PENDING' AND b.createAt < :cutoffTime")
    List<Booking> findPendingBookingsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);

    // ============================================================
    // ADMIN QUERIES
    // ============================================================
    
    /**
     * Tìm kiếm booking với phân trang và lọc cho admin
     */
    @Query("""
        SELECT b FROM Booking b 
        WHERE (:searchTerm IS NULL OR :searchTerm = '' OR 
               LOWER(b.contactName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
               LOWER(b.contactPhone) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
               LOWER(b.contactEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
               EXISTS (SELECT br FROM BookingRoom br JOIN Room r ON br.roomId = r.roomId 
                      WHERE br.bookingId = b.bookingId AND LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))
        AND (:status IS NULL OR :status = '' OR b.status = :status)
        """)
    Page<Booking> findBookingsForAdmin(
        @Param("searchTerm") String searchTerm,
        @Param("status") String status,
        Pageable pageable
    );
    
    /**
     * Lấy booking detail cho admin với thông tin đầy đủ
     */
    @Query("""
        SELECT b FROM Booking b 
        LEFT JOIN FETCH BookingRoom br ON b.bookingId = br.bookingId
        LEFT JOIN FETCH Room r ON br.roomId = r.roomId
        LEFT JOIN FETCH RoomType rt ON r.roomTypeId = rt.roomTypeId
        WHERE b.bookingId = :bookingId
        """)
    Optional<Booking> findBookingDetailForAdmin(@Param("bookingId") Long bookingId);

    //Lấy về Dashboard
    List<Booking> findByCheckinDateBetween(LocalDateTime start, LocalDateTime end);
}