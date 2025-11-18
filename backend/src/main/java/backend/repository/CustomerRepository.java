package backend.repository;

import backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail (String email);
    Optional<Customer> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByCitizenId(String citizenId);
    List<Customer> findByPhoneContainingOrEmailContainingOrFullNameContainingIgnoreCase(
            String phone, String email, String fullName
    );
}
