package backend.repository;

import backend.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    java.util.List<ServiceCategory> findByIsActiveTrue();
}
