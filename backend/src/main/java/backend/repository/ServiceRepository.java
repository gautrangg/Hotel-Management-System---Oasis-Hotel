package backend.repository;

import backend.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    boolean existsByServiceNameIgnoreCase(String serviceName);

    List<Service> findByCategoryId(Long categoryId);

    List<Service> findByIsActiveTrue();

    List<Service> findByCategoryIdAndIsActiveTrue(Long categoryId);
}
