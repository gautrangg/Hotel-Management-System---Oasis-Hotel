package backend.repository;

import backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface InvoiceRepository  extends JpaRepository<Invoice, Long> {
    public Optional<Invoice> findByBookingId(Long bookingId);

    Optional<Invoice> findFirstByBookingIdOrderByInvoiceDateDesc(Long bookingId);

    //Lấy về Dashboard
    List<Invoice> findByStatus(String status);
    List<Invoice> findByStatusAndInvoiceDateAfter(String status, LocalDateTime date);
    List<Invoice> findByStatusAndInvoiceDateBetween(String status, LocalDateTime start, LocalDateTime end);
}
