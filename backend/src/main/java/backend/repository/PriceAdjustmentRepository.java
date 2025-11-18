package backend.repository;

import backend.entity.PriceAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PriceAdjustmentRepository extends JpaRepository<PriceAdjustment, Long>{
    @Query("SELECT p FROM PriceAdjustment p WHERE p.startDate <= :endDate AND p.endDate >= :startDate")
    List<PriceAdjustment> findOverlappingAdjustments(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM PriceAdjustment p WHERE p.adjustmentId != :id AND p.startDate <= :endDate AND p.endDate >= :startDate")
    List<PriceAdjustment> findOverlappingAdjustmentsForUpdate(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("id") Long id
    );
}
