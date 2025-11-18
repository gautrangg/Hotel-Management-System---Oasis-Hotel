package backend.service;

import backend.entity.Customer;
import backend.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String UPLOAD_DIR = "upload/avatar/";

    public List<Customer> searchCustomers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return customerRepository.findByPhoneContainingOrEmailContainingOrFullNameContainingIgnoreCase(query, query, query);
    }

    @GetMapping
    public List<Customer> getAll() {
        return customerRepository.findAll();
    }
    @GetMapping("/byEmail")
    public Customer getByEmail(@RequestParam String email) {
        return customerRepository.findByEmail(email).orElse(null);
    }
    
    public Customer getByPhone(String phone) {
        return customerRepository.findByPhone(phone).orElse(null);
    }
    public List<Customer> findAll() {
        return customerRepository.findAll();
    }
    @GetMapping("/profile/{id}")
    public ResponseEntity<Customer> getProfile(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public Optional<Customer> getCustomerById(Long customerId) {
        return customerRepository.findById(customerId);
    }

    /**
     * Create a new customer with validation.
     * Validates unique constraints on email, phone, and citizenId.
     */
    public Customer createCustomer(Customer customer) {
        // Required fields validation
        if (customer.getFullName() == null || customer.getFullName().trim().isEmpty()) {
            throw new RuntimeException("Full name is required");
        }
        if (customer.getEmail() == null || customer.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (customer.getPassword() == null || customer.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        // Unique constraints validation
        if (customer.getEmail() != null && customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (customer.getPhone() != null && customerRepository.existsByPhone(customer.getPhone())) {
            throw new RuntimeException("Phone number already exists");
        }
        if (customer.getCitizenId() != null && customerRepository.existsByCitizenId(customer.getCitizenId())) {
            throw new RuntimeException("Citizen ID already exists");
        }

        // Set default values
        customer.setCustomerId(null); // ensure new record
        if (customer.getActive() == null) {
            customer.setActive(true);
        }
        
        // Standardize gender if provided
        if (customer.getGender() != null) {
            String gender = customer.getGender().trim().toLowerCase();
            customer.setGender(gender.equals("female") ? "Female" : "Male");
        }

        return customerRepository.save(customer);
    }

    /**
     * Update an existing customer by ID.
     * Validates unique constraints except for the current customer.
     */
    public Customer updateCustomer(Long id, Customer updateData) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Validate unique constraints (excluding current customer)
        if (updateData.getEmail() != null && !updateData.getEmail().equals(existing.getEmail()) && 
            customerRepository.findByEmail(updateData.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (updateData.getPhone() != null && !updateData.getPhone().equals(existing.getPhone()) && 
            customerRepository.existsByPhone(updateData.getPhone())) {
            throw new RuntimeException("Phone number already exists");
        }
        if (updateData.getCitizenId() != null && !updateData.getCitizenId().equals(existing.getCitizenId()) && 
            customerRepository.existsByCitizenId(updateData.getCitizenId())) {
            throw new RuntimeException("Citizen ID already exists");
        }

        if (updateData.getFullName() != null) existing.setFullName(updateData.getFullName());
        if (updateData.getEmail() != null) existing.setEmail(updateData.getEmail());
        if (updateData.getPassword() != null) existing.setPassword(updateData.getPassword());
        if (updateData.getPhone() != null) existing.setPhone(updateData.getPhone());
        if (updateData.getBirthDate() != null) existing.setBirthDate(updateData.getBirthDate());
        if (updateData.getGender() != null) {
            String gender = updateData.getGender().trim().toLowerCase();
            existing.setGender(gender.equals("female") ? "Female" : "Male");
        }
        if (updateData.getCitizenId() != null) existing.setCitizenId(updateData.getCitizenId());
        if (updateData.getAddress() != null) existing.setAddress(updateData.getAddress());
        if (updateData.getAvatar() != null) existing.setAvatar(updateData.getAvatar());
        if (updateData.getActive() != null) existing.setActive(updateData.getActive());

        return customerRepository.save(existing);
    }


    // ----------- Register -----------
    public Customer register(String name, String email, String password, String phoneNumber, LocalDate birthDate,
                              String gender, String address,String citizenId) {
        if (customerRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (customerRepository.existsByPhone(phoneNumber)) {
            throw new RuntimeException("Phone number already exists");
        }
        if (customerRepository.existsByCitizenId(citizenId)) {
            throw new RuntimeException("Citizen ID already exists");
        }

        String Gender = (gender != null) ? ((gender.equals("female"))?"Female" : "Male") : null;

        Customer customer = new Customer();
        customer.setFullName(name);
        customer.setEmail(email);
        customer.setPassword(passwordEncoder.encode(password));
        customer.setPhone(phoneNumber);
        customer.setCitizenId(citizenId);
        customer.setGender(Gender);
        customer.setBirthDate(birthDate);
        customer.setAddress(address);
        customer.setAvatar("avatar.png");
        return customerRepository.save(customer);
    }
    // ----------- Login -----------
    public Optional<Customer> login(String email, String password) {
        return customerRepository.findByEmail(email)
                .filter(c -> passwordEncoder.matches(password,c.getPassword()));
    }

    // ----------- Find by Email/ID -----------
    public Optional<Customer> findByEmail(String email) {
        return customerRepository.findByEmail(email);
    }

    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    // ----------- Update profile (info only, not password) -----------
    public Customer updateProfile(Long id, Customer updateData) {
        return customerRepository.findById(id).map(customer -> {
            // ✅ THÊM: Update tất cả fields từ form
            if (updateData.getFullName() != null) {
                customer.setFullName(updateData.getFullName());
            }
            if (updateData.getEmail() != null) {
                customer.setEmail(updateData.getEmail());
            }
            if (updateData.getPhone() != null) {
                customer.setPhone(updateData.getPhone());
            }
            if (updateData.getCitizenId() != null) {
                customer.setCitizenId(updateData.getCitizenId());
            }
            if (updateData.getAddress() != null) {
                customer.setAddress(updateData.getAddress());
            }
            if (updateData.getBirthDate() != null) {
                customer.setBirthDate(updateData.getBirthDate());
            }
            if (updateData.getGender() != null) {
                customer.setGender(updateData.getGender());
            }
            // Thêm vào CustomerService.updateProfile()
            if (updateData.getEmail() != null && !updateData.getEmail().equals(customer.getEmail())) {
                if (customerRepository.findByEmail(updateData.getEmail()).isPresent()) {
                    throw new RuntimeException("Email already exists");
                }
            }

            if (updateData.getPhone() != null && !updateData.getPhone().equals(customer.getPhone())) {
                if (customerRepository.existsByPhone(updateData.getPhone())) {
                    throw new RuntimeException("Phone number already exists");
                }
            }

            if (updateData.getCitizenId() != null && !updateData.getCitizenId().equals(customer.getCitizenId())) {
                if (customerRepository.existsByCitizenId(updateData.getCitizenId())) {
                    throw new RuntimeException("Citizen ID already exists");
                }
            }

            return customerRepository.save(customer);
        }).orElse(null);
    }
    public String uploadAvatar(Long customerId, MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new RuntimeException("File is empty");

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Delete old avatar
        if (customer.getAvatar() != null && !customer.getAvatar().equals("avatar.png")) {
            try {
                Files.deleteIfExists(Paths.get(UPLOAD_DIR + customer.getAvatar()));
            } catch (IOException e) {}
        }

        // Save new file
        String filename = "customer_" + customerId + "_" + System.currentTimeMillis() + ".jpg";
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        customer.setAvatar(filename);
        customerRepository.save(customer);
        return filename;
    }

    // ----------- Change password -----------
    public boolean changePassword(Long id, String oldPass, String newPass) {
        return customerRepository.findById(id).map(c -> {
            if (!passwordEncoder.matches(oldPass,c.getPassword())) {
                return false; // old password sai
            }
            c.setPassword(passwordEncoder.encode(newPass));
            customerRepository.save(c);
            return true;
        }).orElse(false);
    }
}
