package backend.repository;

import backend.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByBookingId(Long bookingId);
    List<ServiceRequest> findByBookingIdAndStatusNotIn(Long bookingId, List<String> statuses);
    List<ServiceRequest> findByBookingIdAndStatusIn(Long bookingId, List<String> statuses);
    List<ServiceRequest> findByStaffId(Long staffId);

}