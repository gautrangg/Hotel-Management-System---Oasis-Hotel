package backend.repository;

import backend.entity.GuestDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuestDetailRepository extends JpaRepository<GuestDetail, Long> {
    
    /**
     * Lấy danh sách GuestDetail theo bookingId
     */
    List<GuestDetail> findByBookingId(Long bookingId);
    
    /**
     * Xóa tất cả GuestDetail theo bookingId
     */
    void deleteByBookingId(Long bookingId);
    
    /**
     * Kiểm tra xem có GuestDetail nào với citizenId và bookingId khác không
     */
    @Query("SELECT gd FROM GuestDetail gd WHERE gd.citizenId = :citizenId AND gd.bookingId != :bookingId")
    List<GuestDetail> findByCitizenIdAndBookingIdNot(@Param("citizenId") String citizenId, @Param("bookingId") Long bookingId);
}
