package backend.repository;

import backend.dto.room.AvailableRoomDTO;
import backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomNumber(String roomNumber);

    List<Room> findByRoomTypeId(Long roomTypeId);

    List<Room> findByRoomTypeIdAndStatus(Long roomTypeId, String status);

    @Query("""
        SELECT CASE WHEN COUNT(br) > 0 THEN false ELSE true END
        FROM BookingRoom br JOIN Booking b ON br.bookingId = b.bookingId
        WHERE br.roomId = :roomId
        AND UPPER(b.status) NOT IN ('CANCELLED', 'CHECKED-OUT')
        AND (b.checkinDate < :checkoutDate AND b.checkoutDate > :checkinDate)
    """)
    boolean isRoomAvailable(
            @Param("roomId") Long roomId,
            @Param("checkinDate") LocalDateTime checkinDate,     // SỬA: thành LocalDateTime
            @Param("checkoutDate") LocalDateTime checkoutDate   // SỬA: thành LocalDateTime
    );

    @Query("""
        SELECT r FROM Room r
        WHERE r.isActive = true
          AND r.roomTypeId = :roomTypeId
          AND r.roomId NOT IN (
            SELECT br.roomId FROM BookingRoom br JOIN Booking b ON br.bookingId = b.bookingId
            WHERE UPPER(b.status) NOT IN ('CANCELLED', 'CHECKED-OUT')
              AND (b.checkinDate < :checkoutDate AND b.checkoutDate > :checkinDate)
          )
    """)
    List<Room> findAvailableRoomsByRoomTypeAndDateRange(
            @Param("roomTypeId") Long roomTypeId,
            @Param("checkinDate") LocalDateTime checkinDate,
            @Param("checkoutDate") LocalDateTime checkoutDate
    );

    @Query("""
        SELECT r FROM Room r
        WHERE r.isActive = true
          AND r.roomId NOT IN (
            SELECT br.roomId FROM BookingRoom br JOIN Booking b ON br.bookingId = b.bookingId
            WHERE UPPER(b.status) NOT IN ('CANCELLED', 'CHECKED-OUT')
              AND (b.checkinDate < :checkoutDate AND b.checkoutDate > :checkinDate)
          )
    """)
    List<Room> findAvailableRoomsInDateRange(
            @Param("checkinDate") LocalDateTime checkinDate,
            @Param("checkoutDate") LocalDateTime checkoutDate
    );

    List<Room> findByRoomTypeIdAndIsActiveTrue(Long roomTypeId);



    @Query("SELECT new backend.dto.room.AvailableRoomDTO(r.roomId, r.roomNumber, rt.roomTypeName, rt.adult, rt.children, rt.price) " +
            "FROM Room r JOIN RoomType rt ON r.roomTypeId = rt.roomTypeId " +
            "WHERE r.status = :status")
    List<AvailableRoomDTO> findAvailableRoomsInfoByStatus(@Param("status") String status);

    @Query("SELECT new backend.dto.room.AvailableRoomDTO(r.roomId, r.roomNumber, rt.roomTypeName, rt.adult, rt.children, rt.price) " +
            "FROM Room r JOIN RoomType rt ON r.roomTypeId = rt.roomTypeId " +
            "WHERE r.status = :status AND r.roomTypeId = :roomTypeId")
    List<AvailableRoomDTO> findAvailableRoomsInfoByStatusAndRoomTypeId(@Param("status") String status, @Param("roomTypeId") Long roomTypeId);

    @Query("SELECT new backend.dto.room.AvailableRoomDTO(r.roomId, r.roomNumber, rt.roomTypeName, rt.adult, rt.children, rt.price) " +
            "FROM Room r JOIN RoomType rt ON r.roomTypeId = rt.roomTypeId " +
            "WHERE r.status = 'Available' AND r.roomTypeId = :roomTypeId " +
            "AND NOT EXISTS (" +
            "  SELECT 1 FROM Booking b, BookingRoom br " + // 💡 1. JOIN thủ công
            "  WHERE b.bookingId = br.bookingId " +        // 💡 2. Nối 2 bảng
            "  AND br.roomId = r.roomId " +               // 3. Khớp với phòng bên ngoài
            "  AND b.status != 'Cancelled' " +
            "  AND b.checkinDate < :checkoutDate " +     // 4. Logic check overlap
            "  AND b.checkoutDate > :checkinDate" +
            ")")
    List<AvailableRoomDTO> findAvailableRoomsByDateAndType(
            @Param("checkinDate") LocalDateTime checkinDate,
            @Param("checkoutDate") LocalDateTime checkoutDate,
            @Param("roomTypeId") Long roomTypeId
    );

    /**
     * 💡 SỬA LỖI (Tương tự, bỏ lọc roomTypeId)
     */
    @Query("SELECT new backend.dto.room.AvailableRoomDTO(r.roomId, r.roomNumber, rt.roomTypeName, rt.adult, rt.children, rt.price) " +
            "FROM Room r JOIN RoomType rt ON r.roomTypeId = rt.roomTypeId " +
            "WHERE r.status = 'Available' " +
            "AND NOT EXISTS (" +
            "  SELECT 1 FROM Booking b, BookingRoom br " + // 💡 1. JOIN thủ công
            "  WHERE b.bookingId = br.bookingId " +        // 💡 2. Nối 2 bảng
            "  AND br.roomId = r.roomId " +
            "  AND b.status != 'Cancelled' " +
            "  AND b.checkinDate < :checkoutDate " +
            "  AND b.checkoutDate > :checkinDate" +
            ")")
    List<AvailableRoomDTO> findAvailableRoomsByDate(
            @Param("checkinDate") LocalDateTime checkinDate,
            @Param("checkoutDate") LocalDateTime checkoutDate
    );

    //Lấy về Dashboard
    List<Room> findByIsActive(Boolean isActive);
}